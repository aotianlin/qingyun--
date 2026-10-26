/**
 * 滚动回调回归复现器（Node 侧，不依赖微信开发者工具）
 *
 * 目的：给「页面滚动 → setData」这条最热的链路建一条可复现的度量基线。
 * 做法：把一个小程序页面的 JS 直接 require 进 Node，用最小桩替换 Page/getApp/wx，
 *       然后喂一条确定性的 scrollTop 轨迹，记录：
 *         - setData 调用次数（总量 + 按 key 拆分）
 *         - 每个事件之后 navHide 的真实取值序列（用于证明行为等价）
 *         - 最终 data 快照
 *
 * 用法：
 *   node tools/perf/scroll-replay.js                      # 跑全部页面，打印表格
 *   node tools/perf/scroll-replay.js --out=baseline.json  # 存基线
 *   node tools/perf/scroll-replay.js --compare=baseline.json  # 与基线对比
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "../..");

/* ---------------- 最小桩 ---------------- */
function installStubs() {
  global.getApp = () => ({
    globalData: { sbTop: 52, statusBarHeight: 44, navTop: 88 }
  });
  const noop = () => {};
  global.wx = {
    getStorageSync: () => [],
    setStorageSync: noop,
    removeStorageSync: noop,
    showToast: noop,
    hideToast: noop,
    showActionSheet: noop,
    setClipboardData: noop,
    navigateTo: noop,
    navigateBack: noop,
    redirectTo: noop,
    switchTab: noop,
    pageScrollTo: noop,
    setNavigationBarTitle: noop,
    getSystemInfoSync: () => ({ statusBarHeight: 44, windowWidth: 375, windowHeight: 812 }),
    getWindowInfo: () => ({ statusBarHeight: 44, windowWidth: 375, windowHeight: 812 }),
    getMenuButtonBoundingClientRect: () => ({ bottom: 80, height: 32, top: 48 }),
    createSelectorQuery: () => {
      const q = {
        in: () => q,
        select: () => q,
        selectAll: () => q,
        boundingClientRect: (cb) => { if (typeof cb === "function") cb({ top: 60, bottom: 104, left: 16, width: 280, height: 44 }); return q; },
        exec: (cb) => { if (typeof cb === "function") cb([{ top: 60, bottom: 104, left: 16, width: 280, height: 44 }]); }
      };
      return q;
    }
  };
  global.Page = (opts) => { global.__captured = opts; };
  global.Component = (opts) => { global.__captured = opts; };
}

/* ---------------- setData 桩：同步落 data，并记录 ---------------- */
function applyPatch(data, patch) {
  Object.keys(patch).forEach((k) => {
    // 支持 a.b / a[0].b 这类路径写法（本项目里 post-detail 用到，页面基本是扁平的）
    if (k.indexOf(".") < 0 && k.indexOf("[") < 0) { data[k] = patch[k]; return; }
    const segs = k.replace(/\[(\d+)\]/g, ".$1").split(".");
    let cur = data;
    for (let i = 0; i < segs.length - 1; i++) {
      if (cur[segs[i]] === undefined) cur[segs[i]] = {};
      cur = cur[segs[i]];
    }
    cur[segs[segs.length - 1]] = patch[k];
  });
}

function instantiate(opts, rec) {
  const inst = Object.assign({}, opts);
  inst.data = JSON.parse(JSON.stringify(opts.data || {}));
  inst.setData = function (patch, cb) {
    if (patch && typeof patch === "object") {
      rec.calls++;
      Object.keys(patch).forEach((k) => { rec.byKey[k] = (rec.byKey[k] || 0) + 1; });
      applyPatch(this.data, patch);
    }
    if (typeof cb === "function") cb();
  };
  inst.triggerEvent = () => {};
  inst.selectComponent = () => ({ open() {}, close() {} });
  return inst;
}

/* ---------------- 确定性滚动轨迹 ---------------- */
// 模拟一次真实的「下滑 700px → 停 → 上滑回顶 → 小幅回弹」，60Hz，共 240 个事件
function buildTrace() {
  const t = [];
  let y = 0;
  const push = (v) => t.push(Math.round(v));
  for (let i = 0; i < 30; i++) push(y += 0.5);              // 首帧细微抖动（< 2px 阈值内）
  for (let i = 0; i < 70; i++) push(y += 7);                // 正常下滑 0 → 490
  for (let i = 0; i < 20; i++) push(y += 14);               // 加速下滑 → 770
  for (let i = 0; i < 20; i++) push(y);                     // 停顿（delta = 0）
  for (let i = 0; i < 40; i++) push(y -= 9);                // 上滑 → 410
  for (let i = 0; i < 30; i++) push(y -= 16);               // 快速上滑
  for (let i = 0; i < 30; i++) push(Math.max(0, y));        // 回弹到顶
  return t;
}

/* ---------------- 跑单个页面 ---------------- */
function runPage(rel) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return null;
  delete require.cache[require.resolve(file)];
  global.__captured = null;
  try { require(file); } catch (e) { return { page: rel, error: String(e && e.message) }; }
  const opts = global.__captured;
  if (!opts) return { page: rel, error: "未捕获到 Page()/Component()" };
  const methods = Object.assign({}, opts, opts.methods || {});
  if (typeof methods.onPageSc !== "function") return { page: rel, skipped: "无 onPageSc" };

  const rec = { calls: 0, byKey: {} };
  const inst = instantiate(opts, rec);
  if (opts.methods) Object.assign(inst, opts.methods);

  const trace = buildTrace();
  const states = [];
  for (let i = 0; i < trace.length; i++) {
    inst.onPageSc({ detail: { scrollTop: trace[i] } });
    states.push(inst.data.navHide ? 1 : 0);
  }
  return {
    page: rel,
    events: trace.length,
    setDataCalls: rec.calls,
    byKey: rec.byKey,
    transitions: states.filter((v, i) => i > 0 && v !== states[i - 1]).length,
    stateHash: crypto.createHash("md5").update(states.join("")).digest("hex").slice(0, 12),
    finalNavHide: !!inst.data.navHide
  };
}

/* ---------------- 主流程 ---------------- */
function main() {
  installStubs();
  const pages = fs.readdirSync(path.join(ROOT, "pages"))
    .map((d) => `pages/${d}/${d}.js`)
    .filter((p) => fs.existsSync(path.join(ROOT, p)));

  const results = pages.map(runPage).filter(Boolean);
  const active = results.filter((r) => !r.error && !r.skipped);

  const outArg = process.argv.find((a) => a.startsWith("--out="));
  const cmpArg = process.argv.find((a) => a.startsWith("--compare="));

  if (outArg) {
    const out = outArg.slice(6);
    fs.writeFileSync(path.join(__dirname, out), JSON.stringify(results, null, 2));
    console.log(`已写入基线 ${out}（${active.length} 个页面参与统计）`);
    return;
  }

  if (cmpArg) {
    const baseFile = path.join(__dirname, cmpArg.slice(10));
    const base = JSON.parse(fs.readFileSync(baseFile, "utf8"));
    const byPage = {};
    base.forEach((b) => { byPage[b.page] = b; });
    let same = 0, diff = 0, saved = 0;
    console.log("页面".padEnd(42) + "setData(前→后)".padEnd(20) + "状态序列");
    console.log("-".repeat(84));
    active.forEach((r) => {
      const b = byPage[r.page] || {};
      const ok = b.stateHash && b.stateHash === r.stateHash && b.finalNavHide === r.finalNavHide;
      saved += (b.setDataCalls || 0) - r.setDataCalls;
      if (ok) same++; else diff++;
      console.log(
        r.page.padEnd(42) +
        `${String(b.setDataCalls || 0)} → ${r.setDataCalls}`.padEnd(20) +
        (ok ? "一致 ✓" : "不一致 ✗")
      );
    });
    console.log("-".repeat(84));
    console.log(`行为一致 ${same} / 不一致 ${diff}；setData 总调用减少 ${saved} 次`);
    process.exitCode = diff ? 1 : 0;
    return;
  }

  console.log("页面".padEnd(42) + "事件数".padEnd(9) + "setData".padEnd(9) + "翻转次数".padEnd(10) + "末态");
  console.log("-".repeat(84));
  active.forEach((r) => {
    console.log(
      r.page.padEnd(42) + String(r.events).padEnd(9) + String(r.setDataCalls).padEnd(9) +
      String(r.transitions).padEnd(10) + String(r.finalNavHide)
    );
  });
  const total = active.reduce((s, r) => s + r.setDataCalls, 0);
  console.log("-".repeat(84));
  console.log(`参与页面 ${active.length} 个，setData 合计 ${total} 次`);
  results.filter((r) => r.error).forEach((r) => console.log(`  [跳过] ${r.page}: ${r.error}`));
  results.filter((r) => r.skipped).forEach((r) => console.log(`  [跳过] ${r.page}: ${r.skipped}`));
}

main();
