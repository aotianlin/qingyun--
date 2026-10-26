/**
 * 页面生命周期 setData 计数（Node 侧）
 *
 * 目的：验证「进页面 / 每次返回页面」到底下发了几次 setData、每次改写了哪些 key。
 * 用法：
 *   node tools/perf/lifecycle-census.js                     # 打印表格
 *   node tools/perf/lifecycle-census.js --out=life.json     # 存基线
 *   node tools/perf/lifecycle-census.js --compare=life.json # 与基线比对
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");

function installStubs() {
  global.getApp = () => ({ globalData: { sbTop: 52, statusBarHeight: 44, navTop: 88 } });
  const noop = () => {};
  global.wx = {
    getStorageSync: () => [],
    setStorageSync: noop,
    removeStorageSync: noop,
    showToast: noop,
    setClipboardData: noop,
    navigateTo: noop,
    navigateBack: noop,
    redirectTo: noop,
    switchTab: noop,
    pageScrollTo: noop,
    getSystemInfoSync: () => ({ statusBarHeight: 44 }),
    getWindowInfo: () => ({ statusBarHeight: 44 }),
    getMenuButtonBoundingClientRect: () => ({ bottom: 80, height: 32, top: 48 }),
    createSelectorQuery: () => {
      const q = {
        in: () => q, select: () => q, selectAll: () => q,
        boundingClientRect: (cb) => { if (typeof cb === "function") cb({ top: 60, bottom: 104, left: 16, width: 280, height: 44 }); return q; },
        exec: (cb) => { if (typeof cb === "function") cb([{ top: 60, bottom: 104, left: 16, width: 280, height: 44 }]); }
      };
      return q;
    }
  };
  global.Page = (o) => { global.__captured = o; };
  global.Component = (o) => { global.__captured = o; };
}

function applyPatch(data, patch) {
  Object.keys(patch).forEach((k) => {
    if (k.indexOf(".") < 0 && k.indexOf("[") < 0) { data[k] = patch[k]; return; }
    const segs = k.replace(/\[(\d+)\]/g, ".$1").split(".");
    let cur = data;
    for (let i = 0; i < segs.length - 1; i++) { if (cur[segs[i]] === undefined) cur[segs[i]] = {}; cur = cur[segs[i]]; }
    cur[segs[segs.length - 1]] = patch[k];
  });
}

function run(rel) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return null;
  delete require.cache[require.resolve(file)];
  global.__captured = null;
  try { require(file); } catch (e) { return { page: rel, error: String(e && e.message) }; }
  const opts = global.__captured;
  if (!opts) return { page: rel, error: "未捕获到 Page()" };

  const calls = [];
  const inst = Object.assign({}, opts, opts.methods || {});
  inst.data = JSON.parse(JSON.stringify(opts.data || {}));
  inst.setData = function (patch) {
    if (patch && typeof patch === "object") { calls.push(Object.keys(patch).sort().join(",")); applyPatch(this.data, patch); }
  };
  inst.triggerEvent = () => {};
  inst.selectComponent = () => ({ open() {}, close() {} });

  const errs = [];
  const phase = (name, fn) => {
    const before = calls.length;
    try { if (typeof fn === "function") fn.call(inst); } catch (e) { errs.push(`${name}: ${e.message}`); return 0; }
    return calls.length - before;
  };

  const load = phase("onLoad", inst.onLoad);
  const show1 = phase("onShow", inst.onShow);
  const show2 = phase("onShow", inst.onShow);   // 模拟从子页返回
  // 终态指纹：用来证明「setData 变少但页面数据完全一致」
  let dataHash = null;
  try { dataHash = require("crypto").createHash("md5").update(JSON.stringify(inst.data)).digest("hex").slice(0, 12); } catch (e) {}
  return {
    page: rel,
    onLoad: load, onShow1: show1, onShow2: show2,
    errs, dataHash,
    showKeys: calls.slice(-show2 || calls.length)
  };
}

function main() {
  installStubs();
  const pages = fs.readdirSync(path.join(ROOT, "pages"))
    .map((d) => `pages/${d}/${d}.js`).filter((p) => fs.existsSync(path.join(ROOT, p)));
  const res = pages.map(run).filter(Boolean);
  const ok = res.filter((r) => !r.error);

  const outArg = process.argv.find((a) => a.startsWith("--out="));
  const cmpArg = process.argv.find((a) => a.startsWith("--compare="));

  if (outArg) {
    fs.writeFileSync(path.join(__dirname, outArg.slice(6)), JSON.stringify(res, null, 2));
    console.log(`已写入 ${outArg.slice(6)}（${ok.length} 页）`);
    return;
  }
  if (cmpArg) {
    const base = JSON.parse(fs.readFileSync(path.join(__dirname, cmpArg.slice(10)), "utf8"));
    const by = {}; base.forEach((b) => { by[b.page] = b; });
    let diff = 0, saved = 0, bad = 0;
    console.log("页面".padEnd(42) + "onLoad".padEnd(12) + "onShow(首次)".padEnd(16) + "onShow(返回)".padEnd(16) + "终态数据");
    console.log("-".repeat(96));
    ok.forEach((r) => {
      const b = by[r.page] || {};
      const d = (b.onLoad || 0) - r.onLoad + (b.onShow1 || 0) - r.onShow1 + (b.onShow2 || 0) - r.onShow2;
      saved += d;
      if (d > 0) diff++;
      const same = !b.dataHash || b.dataHash === r.dataHash;
      if (!same) bad++;
      console.log(
        r.page.padEnd(42) +
        `${b.onLoad || 0} → ${r.onLoad}`.padEnd(12) +
        `${b.onShow1 || 0} → ${r.onShow1}`.padEnd(16) +
        `${b.onShow2 || 0} → ${r.onShow2}`.padEnd(16) +
        (same ? "一致 ✓" : "变化 ✗") + (d > 0 ? `  (−${d})` : "")
      );
    });
    console.log("-".repeat(96));
    console.log(`合计减少 ${saved} 次 setData（${diff} 个页面受益）；终态数据 ${bad ? bad + " 处发生变化 ✗" : "全部一致 ✓"}`);
    process.exitCode = bad ? 1 : 0;
    return;
  }

  console.log("页面".padEnd(42) + "onLoad".padEnd(12) + "onShow1".padEnd(12) + "onShow2");
  console.log("-".repeat(80));
  ok.forEach((r) => console.log(r.page.padEnd(42) + String(r.onLoad).padEnd(12) + String(r.onShow1).padEnd(12) + String(r.onShow2)));
  res.filter((r) => r.error).forEach((r) => console.log(`  [跳过] ${r.page}: ${r.error}`));
}

main();
