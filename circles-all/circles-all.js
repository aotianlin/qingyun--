const { CIRCLES } = require("../../data/circles.js");
const CATS = ["全部", "学习", "考研", "生活", "兴趣"];

const { filterSearch } = require("../../data/search.js");
const HOT = ["数据结构期末", "转专业", "四六级听力", "晚霞机位", "考研政治", "图书馆占座", "文献综述降重", "宿舍限电"];

Page({
  data: {
    sb: 52,
    navHide: false,
    searchOpen: false,
    sdTop: 0,
    sdFocus: false,
    kw: "",
    rPosts: [], rRes: [], rCircles: [], rUsers: [], count: 0,
    sdHot: HOT, cats: CATS, allCat: "全部", rows: [] },
  onLoad() {
    this.setData({ sb: getApp().globalData.sbTop, rows: this._rowPayload() }); },
  _rowPayload() {
    return Object.keys(CIRCLES)
      .filter(k => this.data.allCat === "全部" || CIRCLES[k].cat === this.data.allCat)
      .map(k => ({ k, name: CIRCLES[k].name, ch: CIRCLES[k].ch, bg: CIRCLES[k].bg, desc: CIRCLES[k].desc, stat: CIRCLES[k].stats[0] + " · " + CIRCLES[k].stats[1], joined: CIRCLES[k].joined }));
  },
  renderAll() {
    this.setData({ rows: this._rowPayload() });
  },
  onCat(e) { this.setData({ allCat: e.currentTarget.dataset.c }); this.renderAll(); },
  toggleJoin(e) {
    const k = e.currentTarget.dataset.k;
    CIRCLES[k].joined = !CIRCLES[k].joined;
    wx.showToast({ title: (CIRCLES[k].joined ? "已加入「" : "已退出「") + CIRCLES[k].name + "」", icon: "none" });
    this.renderAll();
  },
  goCircle(e) { wx.navigateTo({ url: "/pages/circle-detail/circle-detail?key=" + e.currentTarget.dataset.k }); },
  onPageSc(e) {
    const st = e.detail.scrollTop;
    const last = this._lastSt || 0;
    if (Math.abs(st - last) < 2) return;
    this._lastSt = st;
    // 只有 nav-hide 真的翻转才下发：滚动中每帧 setData 会让样式重算跑满 60fps
    const hide = st > 80 && st > last;
    if (hide !== this.data.navHide) this.setData({ navHide: hide });
  },
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/circles/circles" }) }); },
  goCreate() { wx.navigateTo({ url: "/pages/space-create/space-create" }); },
  openSearch() {
    wx.createSelectorQuery().in(this).select(".nebula").boundingClientRect(rect => {
      this.setData({ searchOpen: true, sdTop: Math.ceil((rect ? rect.bottom : 120) + 10) });
    }).exec();
  },
  closeSearch() { this.setData({ searchOpen: false, sdFocus: false, kw: "", rPosts: [], rRes: [], rCircles: [], rUsers: [], count: 0 }); },
  onKw(e) { const kw = e.detail.value; this.setData(Object.assign({ kw }, filterSearch(kw, ["circle"]))); },
  onNbF() { this.setData({ sdFocus: true }); },
  onNbB() { this.setData({ sdFocus: false }); },
  onHot(e) { this.runSearch(e.currentTarget.dataset.k); },
  runSearch(k) {
    const v = (typeof k === "string" ? k : (this.data.kw || "")).trim();
    if (!v) { this._toast("输入搜索词"); return; }
    this.setData(Object.assign({ kw: v }, filterSearch(v, ["circle"])));
  },
  tip(e) { wx.showToast({ title: e.currentTarget.dataset.t, icon: "none" }); }
});
