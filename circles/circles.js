const { CIRCLES } = require("../../data/circles.js");
const { filterSearch } = require("../../data/search.js");

const HOT = ["数据结构期末", "转专业", "四六级听力", "晚霞机位", "考研政治", "图书馆占座", "文献综述降重", "宿舍限电"];

Page({
  data: {
    nbFocus: false,
    sb: 52,
    searchOpen: false,
    sdTop: 0,
    sdHot: HOT,
    kw: "", rCircles: [], count: 0,
    hotAll: [
      { k: "algo", cover: "#175A67", name: "算法与数据结构自习室", desc: "刷题、讲题、复盘，每周五晚线上题解分享会。", stat: "186 人 · 142 帖", joined: true },
      { k: "ml", cover: "#0F454F", name: "机器学习读书会", desc: "本周读《动手学深度学习》第 6 章，周日晚上讨论。", stat: "97 人 · 66 帖", joined: false },
      { k: "market", cover: "#E8960C", name: "校园跳蚤市场", desc: "毕业季闲置转让：教材、小家电、自行车。", stat: "412 人 · 356 帖", joined: false }
    ],
    hot: [],
    q: "",
    detailOpen: false,
    toastShow: false,
    toastMsg: ""
  },
  onLoad() {
    this.setData({ sb: getApp().globalData.sbTop, hot: this.data.hotAll });
  },
  onShow() {
    // 热门卡的加入状态与圈子数据保持同步，并保留当前搜索过滤
    const all = this.data.hotAll.map(h => Object.assign({}, h, { joined: CIRCLES[h.k].joined }));
    const q = (this.data.q || "").trim();
    const hot = q ? all.filter(h => h.name.indexOf(q) >= 0 || h.desc.indexOf(q) >= 0) : all;
    this.setData({ hotAll: all, hot });
  },
  openCircle(e) { wx.navigateTo({ url: "/pages/circle-detail/circle-detail?key=" + e.currentTarget.dataset.k }); },
  openAll() { wx.navigateTo({ url: "/pages/circles-all/circles-all" }); },
  goCreate() { wx.navigateTo({ url: "/pages/space-create/space-create" }); },
  openRes() { wx.navigateTo({ url: "/pages/resources/resources" }); },
  toggleJoin(e) {
    const k = e.currentTarget.dataset.k;
    CIRCLES[k].joined = !CIRCLES[k].joined;
    wx.showToast({ title: (CIRCLES[k].joined ? "已加入「" : "已退出「") + CIRCLES[k].name + "」", icon: "none" });
    this.onShow();
  },
  cdTab() { wx.navigateTo({ url: "/pages/circle-detail/circle-detail?key=algo" }); },
  // 就地筛选热门圈子，不跳搜索页
  onNbF() { this.setData({ nbFocus: true }); },
  onNbB() { this.setData({ nbFocus: false }); },
  openSearch() {
    wx.createSelectorQuery().in(this).select(".nebula").boundingClientRect(rect => {
      this.setData({ searchOpen: true, sdTop: Math.ceil((rect ? rect.bottom : 120) + 10) });
    }).exec();
  },
  closeSearch() { this.setData({ searchOpen: false, sdFocus: false, kw: "", rCircles: [], count: 0 }); },
  onHot(e) {
    const k = e.currentTarget.dataset.k;
    const r = filterSearch(k, ["circle"]);
    this.setData({ kw: k, rCircles: r.rCircles, count: r.count });
    this.onSearch({ detail: { value: k } });
  },
  onSearch(e) {
    const q = (e.detail.value || "").trim();
    const all = this.data.hotAll;
    const hot = q ? all.filter(h => h.name.indexOf(q) >= 0 || h.desc.indexOf(q) >= 0) : all;
    const r = filterSearch(q, ["circle"]);
    this.setData({ q, hot, kw: q, rCircles: r.rCircles, count: r.count });
    if (q && !hot.length) this._toast("没有匹配的圈子");
  },
  openDetail() { this.selectComponent("#pd").open(); },
  tip(e) { this._toast(e.currentTarget.dataset.t); },
  onCompTip(e) { this._toast(e.detail.msg); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
