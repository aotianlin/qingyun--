/**
 * mockup → 小程序 构建脚本（全量迁移的机械部分）
 * 1) 提取 mockup <style> → app.wxss：去桌面媒体查询、:root/body→page、px→rpx
 * 2) 提取全文（HTML+JS）所有 <svg> → .icu-N data-URI 类，并输出替换映射
 * 3) 输出打卡进度环类（9 种组合）
 */
const fs = require("fs");
const path = require("path");

const SRC = "D:/develop/qingyun/v3-preview/mockup/index.html";
const OUT_DIR = __dirname + "/..";
const html = fs.readFileSync(SRC, "utf8");

/* ---------- 1) CSS ---------- */
const cssRaw = html.match(/<style>([\s\S]*?)<\/style>/)[1];
let css = cssRaw;
// 去桌面手机壳媒体查询（括号计数，稳删整块）
css = css.replace(/@media\(min-width:600px\)\{/g, "\n/*@mp-strip*/\n");
{
  const out = [];
  let depth = 0;
  for (const line of css.split("\n")) {
    if (line.trim() === "/*@mp-strip*/") { depth = 1; continue; }
    if (depth > 0) {
      for (const ch of line) {
        if (ch === "{") depth++;
        else if (ch === "}") { depth--; if (depth === 0) break; }
      }
      continue;
    }
    out.push(line);
  }
  css = out.join("\n");
}
// :root / body → page
css = css.replace(":root{", "page{");
css = css.replace(/(^|\n)body\{([^\n]*)\}/, (m, n, inner) => n + "page{" + inner + "}");
css = css.replace(/(^|\n)html,body\{height:100%\}\n?/, "");
// 手机壳容器规则废弃
css = css.replace(/\.phone\{[^}]*\}/g, "");
css = css.replace(/\.stage\{[^}]*\}/, ".stage{position:relative}");
// 通配选择器（WXSS 不支持 *）→ 组合选择器
css = css.replace(/\*\{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent\}/,
  "view,text,input,page{margin:0;padding:0;box-sizing:border-box}");
// 元素标签选择器 → 类选择器
const tagMap = { b: "_b", i: "_i", span: "_s", p: "_p", h1: "_h1", h2: "_h2", h3: "_h3", h4: "_h4", em: "_em", button: "_btn" };
for (const [t, c] of Object.entries(tagMap)) {
  css = css.replace(new RegExp("([\\s>.,])" + t + "([ ,{:.])", "g"), "$1." + c + "$2");
}
// :nth-child 交错动效（WXSS 不支持）→ 去掉延迟规则，保留基础样式
css = css.replace(/\.typing \._i:nth-child\([23]\)\{[^}]*\}/g, "");
// ID 选择器（WXSS 不支持）→ 删除（dm/学伴页布局由页面 wxss 承担）
css = css.replace(/#dmOverlay\.show\{[^}]*\}/g, "");
css = css.replace(/#screen-ai\{[^}]*\}/g, "");
css = css.replace(/#screen-ai \.mine-back\{[^}]*\}/g, "");
// WXML 中 div 已改为具名类：同步映射两条 div 元素选择器
css = css.replace(/\.plan div\{/g, ".plan .pv{");
css = css.replace(/\.idcard \.stats div\{/g, ".idcard .stats .sv{");
// input 选择器
css = css.replace(/([.\w-]) input([,{ ])/g, "$1 ._input$2");
// px → rpx（414 设计稿）
const F = 750 / 414;
const px2rpx = (m, v) => {
  let r = Math.round(parseFloat(v) * F * 2) / 2;
  if (r < 1) r = 1;
  return r + "rpx";
};
css = css.replace(/(-?\d+(?:\.\d+)?)px/g, px2rpx);

/* ---------- 2) SVG → icu 类 ---------- */
const icons = {};
let iconSeq = 0;
const sizeOf = (attrs) => {
  const w = (attrs.match(/width="([\d.]+)"/) || [])[1];
  const h = (attrs.match(/height="([\d.]+)"/) || [])[1];
  const r = (v) => { let x = Math.round(parseFloat(v) * F * 2) / 2; if (x < 1) x = 1; return x; };
  return { w: r(w || 24), h: r(h || 24) };
};
let working = html.slice(html.indexOf("<body>"));
working = working.replace(/<svg([^>]*)>([\s\S]*?)<\/svg>/g, (m, attrs, inner) => {
  const key = m.replace(/\s+/g, " ").trim();
  if (!icons[key]) {
    iconSeq++;
    const { w, h } = sizeOf(attrs);
    const encoded = encodeURIComponent(m.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"').replace(/\s+/g, " ").trim());
    icons[key] = ".icu-" + iconSeq + "{width:" + w + "rpx;height:" + h + "rpx;background-image:url(\"data:image/svg+xml," + encoded + "\")}";
  }
  const n = icons[key].match(/icu-(\d+)/)[1];
  return "<view class=\"icu-" + n + "\"/>";
});
// JS 字符串里也替换过了 ✓（working 含 script）

/* ---------- 3) 打卡进度环类 ---------- */
const RINGS = [
  ["r9-30-g", 9, 30, "#175A67", "#0F454F"],
  ["r21-30-a", 21, 30, "#E8960C", "#B26A00"],
  ["r5-14-g", 5, 14, "#175A67", "#0F454F"],
  ["r12-21-g", 12, 21, "#175A67", "#0F454F"],
  ["r18-30-g", 18, 30, "#175A67", "#0F454F"],
  ["r2-7-g", 2, 7, "#175A67", "#0F454F"],
  ["r4-7-g", 4, 7, "#175A67", "#0F454F"],
  ["r15-30-g", 15, 30, "#175A67", "#0F454F"],
  ["r6-30-g", 6, 30, "#175A67", "#0F454F"]
];
let ringCss = "\n/* 打卡进度环（原型 SVG 同款） */\n";
for (const [name, done, total, c1, c2] of RINGS) {
  const off = Math.round(157 * (1 - done / total));
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 60 60"><circle cx="30" cy="30" r="25" fill="none" stroke="#E8EFEF" stroke-width="6"/><circle cx="30" cy="30" r="25" fill="none" stroke="' + c1 + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="157" stroke-dashoffset="' + off + '" transform="rotate(-90 30 30)"/><text x="30" y="34" text-anchor="middle" font-size="12" font-weight="700" fill="' + c2 + '">' + done + "/" + total + '</text></svg>';
  ringCss += ".ring-" + name + "{width:52px;height:52px;background-image:url(\"data:image/svg+xml," + encodeURIComponent(svg) + "\")}\n";
}
// rpx for ring size handled by raw px (52px→) — convert ringCss too
ringCss = ringCss.replace(/(-?\d+(?:\.\d+)?)px/g, px2rpx).replace(/52rpx;height:52rpx/, "94.5rpx;height:94.5rpx");

/* ---------- 4) 汇总 app.wxss ---------- */
const additions = `
/* ===== MP 适配（状态栏/横向滚动/标签映射） ===== */
page { min-height: 100%; }
.screen { display: block; min-height: 100vh; }
._b { font-weight: 700; }
.hscroll { width: 100%; }
/* 真机适配：状态栏避让 + ⊕ 确定性凸起 + 安全区收紧（模拟器 env=0 时与原型一致） */
.page-head { padding-top: calc(47rpx + env(safe-area-inset-top)); }
.tabbar { padding-bottom: calc(4rpx + env(safe-area-inset-bottom)); }
.fab-btn { transform: translateY(-33rpx); }
.fab-btn:active { transform: translateY(-33rpx) scale(0.96); }
.overlay { padding-top: env(safe-area-inset-top); }
/* 触感体系：小程序 :active 不生效，按压反馈走 hover-class */
.press { transform: scale(0.98); }
.press-sm { transform: scale(0.96); }
.press-bg { background: var(--primary-softer); }
.press-conv { background: #E9E4DC; }
.press-fab { transform: translateY(-33rpx) scale(0.96); }
.chip, .w-pill, .nt-row, .ans, .ask-item, .seg-t, .cite { transition: transform 0.12s ease, background-color 0.15s ease, color 0.15s ease; }
.tab { transition: color 0.15s ease; }
/* 私信自己的头像（image 填充圆形容器） */
.dm-ava-img { width: 100%; height: 100%; border-radius: 50%; display: block; }
`;
let out = css + "\n" + ringCss + "\n" + additions + "\n";
// icu 类统一挂 .icu 行为
for (const k of Object.keys(icons)) {
  out += icons[k].replace(/^\.icu-(\d+)\{/, ".icu-$1{display:inline-block;background-repeat:no-repeat;background-position:center;background-size:contain;");
  out += "\n";
}
// currentColor 图标状态化：跟随原型 .tab 文字色（未选中灰 / 选中绿）
let ctxCss = "\n/* currentColor 图标状态化（tab 栏，与原型 currentColor 行为一致） */\n";
for (const [key, cls] of Object.entries(icons)) {
  if (!key.includes("currentColor")) continue;
  const n = cls.match(/icu-(\d+)/)[1];
  const mk = (color) => {
    const svg = key.replace(/stroke="currentColor"/g, 'stroke="' + color + '"')
      .replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"').replace(/\s+/g, " ").trim();
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  };
  ctxCss += ".tab .icu-" + n + "{background-image:" + mk("#96A49C") + "}\n";
  ctxCss += ".tab.on .icu-" + n + "{background-image:" + mk("#175A67") + "}\n";
}
// 其余 currentColor 图标按原型父级颜色固定
const CTX_COLORS = [
  [15, "#5C6B64", ".mine-back"],   // 返回箭头（我的/圈子/问答页头）
  [42, "#0F454F", ".dm-back"],     // 私信返回
  [43, "#5C6B64", ".dm-plus"],     // 私信附件 ⊕
  [44, "#5C6B64", ".chat-back"],   // 历史对话返回
  [8, "#0F454F", ".w-pill.dl"]     // 下载箭头
];
for (const [n, color, parent] of CTX_COLORS) {
  const key = Object.keys(icons).find(k => icons[k].startsWith(".icu-" + n + "{"));
  if (!key) continue;
  const svg = key.replace(/stroke="currentColor"/g, 'stroke="' + color + '"')
    .replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"').replace(/\s+/g, " ").trim();
  ctxCss += parent + " .icu-" + n + "{background-image:url(\"data:image/svg+xml," + encodeURIComponent(svg) + "\")}\n";
}
out += ctxCss;
fs.writeFileSync(path.join(OUT_DIR, "app.wxss"), out);
fs.writeFileSync(path.join(OUT_DIR, "tools", "mockup-compiled.html"), working);
fs.writeFileSync(path.join(OUT_DIR, "tools", "build-report.json"), JSON.stringify({
  cssBytes: out.length,
  iconCount: iconSeq,
  rings: RINGS.length
}, null, 2));
console.log("app.wxss written:", out.length, "bytes |", iconSeq, "unique svgs |", RINGS.length, "rings");
