const { RESOURCES, CATS } = require("../../data/resources.js");

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
    sdHot: HOT,
    cats: CATS,
    cat: "全部",
    sort: "hot",
    list: [],
    toastShow: false,
    toastMsg: ""
  },
  onLoad() { this.setData({ sb: getApp().globalData.sbTop, list: this._listPayload() }); },
  _listPayload() {
    let list = this.data.cat === "全部" ? RESOURCES.slice() : RESOURCES.filter(r => r.cat === this.data.cat);
    if (this.data.sort === "hot") list.sort((a, b) => b.hot - a.hot);
    return list;
  },
  render() {
    this.setData({ list: this._listPayload() });
  },
  onCat(e) { this.setData({ cat: e.currentTarget.dataset.c }); this.render(); },
  onSort(e) { this.setData({ sort: e.currentTarget.dataset.s }); this.render(); },
  goDetail(e) { wx.navigateTo({ url: "/pages/resource-detail/resource-detail?id=" + e.currentTarget.dataset.id }); },
  openSearch() {
    wx.createSelectorQuery().in(this).select(".nebula").boundingClientRect(rect => {
      this.setData({ searchOpen: true, sdTop: Math.ceil((rect ? rect.bottom : 120) + 10) });
    }).exec();
  },
  closeSearch() { this.setData({ searchOpen: false, sdFocus: false, kw: "", rPosts: [], rRes: [], rCircles: [], rUsers: [], count: 0 }); },
  onKw(e) { const kw = e.detail.value; this.setData(Object.assign({ kw }, filterSearch(kw, ["res"]))); },
  onNbF() { this.setData({ sdFocus: true }); },
  onNbB() { this.setData({ sdFocus: false }); },
  onHot(e) { this.runSearch(e.currentTarget.dataset.k); },
  runSearch(k) {
    const v = (typeof k === "string" ? k : (this.data.kw || "")).trim();
    if (!v) { this._toast("输入搜索词"); return; }
    this.setData(Object.assign({ kw: v }, filterSearch(v, ["res"])));
  },
  onPageSc(e) {
    const st = e.detail.scrollTop;
    const last = this._lastSt || 0;
    if (Math.abs(st - last) < 2) return;
    this._lastSt = st;
    // 只有 nav-hide 真的翻转才下发：滚动中每帧 setData 会让样式重算跑满 60fps
    const hide = st > 80 && st > last;
    if (hide !== this.data.navHide) this.setData({ navHide: hide });
  },
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/discover/discover" }) }); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
