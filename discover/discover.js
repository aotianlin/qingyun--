const { filterSearch } = require("../../data/search.js");
const HOT = ["数据结构期末", "转专业", "四六级听力", "晚霞机位", "考研政治", "图书馆占座", "文献综述降重", "宿舍限电"];

// 频道规则集中定义：count 为当前原型内容数，hide 为 CSS 多列筛选类。
// “生活”只保留 photo 图文卡，与“推荐”的区别是去掉问答、资料、打卡。
const CHANNELS = [
  { key: "推荐", count: 10, hide: "" },
  { key: "问答", count: 2, hide: "hide-photo hide-doc hide-chk" },
  { key: "资料", count: 2, hide: "hide-photo hide-qa hide-chk" },
  { key: "打卡", count: 2, hide: "hide-photo hide-qa hide-doc" },
  { key: "生活", count: 4, hide: "hide-qa hide-doc hide-chk" }
];

Page({
  data: {
    sb: 52,
    searchOpen: false,
    sdTop: 0,
    sdFocus: false,
    kw: "",
    rPosts: [], rRes: [], rCircles: [], rUsers: [], count: 0,
    hot: HOT,
    dateStr: "",
    channels: CHANNELS,
    active: "推荐",
    activeCount: 10,
    hideCls: "",
    detailOpen: false,
    toastShow: false,
    toastMsg: ""
  },
  onLoad() {
    const d = new Date();
    const week = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
    this.setData({ sb: getApp().globalData.sbTop, dateStr: (d.getMonth() + 1) + "月" + d.getDate() + "日 · 星期" + week });
  },
  onChannel(e) {
    const key = e.currentTarget.dataset.c;
    const target = CHANNELS.filter(c => c.key === key)[0];
    if (!target || key === this.data.active) return;

    // 查询回包可能乱序，序列号只允许最后一次点击生效
    const seq = (this._channelSeq || 0) + 1;
    this._channelSeq = seq;
    const query = wx.createSelectorQuery().in(this);
    query.select(".itabs").boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(res => {
      if (seq !== this._channelSeq) return;
      const rect = res && res[0];
      const viewport = res && res[1];
      const navTop = getApp().globalData.navTop || 88;
      const shouldScroll = !!(rect && viewport && rect.top < navTop);
      const targetTop = shouldScroll ? Math.max(0, viewport.scrollTop + rect.top - navTop) : 0;

      this.setData({ active: key, activeCount: target.count, hideCls: target.hide }, () => {
        if (shouldScroll) wx.pageScrollTo({ scrollTop: targetTop, duration: 0 });
      });
    });
  },
  showRecommend() {
    const recommend = CHANNELS[0];
    this.setData({ active: recommend.key, activeCount: recommend.count, hideCls: recommend.hide });
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
  },
  openDetail() { this.selectComponent("#pd").open(); },
  goAI() { wx.navigateTo({ url: "/pages/ai/ai" }); },
  openSearch() {
    wx.createSelectorQuery().in(this).select(".nebula").boundingClientRect(rect => {
      this.setData({ searchOpen: true, sdTop: Math.ceil((rect ? rect.bottom : 180) + 10) });
    }).exec();
  },
  // 遮罩关闭保留关键词和结果，下次打开可继续；显式“取消”才清空
  closeSearch() { this.setData({ searchOpen: false, sdFocus: false }); },
  cancelSearch() {
    this.setData({ searchOpen: false, sdFocus: false, kw: "", rPosts: [], rRes: [], rCircles: [], rUsers: [], count: 0 });
  },
  clearKw() {
    this.setData({ kw: "", rPosts: [], rRes: [], rCircles: [], rUsers: [], count: 0 });
  },
  onKw(e) { const kw = e.detail.value; this.setData(Object.assign({ kw }, filterSearch(kw, ["post", "res", "circle", "user"]))); },
  onNbF() { this.setData({ sdFocus: true }); },
  onNbB() { this.setData({ sdFocus: false }); },
  onHot(e) { this.runSearch(e.currentTarget.dataset.k); },
  runSearch(k) {
    const v = (typeof k === "string" ? k : (this.data.kw || "")).trim();
    if (!v) { this._toast("输入搜索词"); return; }
    this.setData(Object.assign({ kw: v }, filterSearch(v, ["post", "res", "circle", "user"])));
    if (wx.hideKeyboard) wx.hideKeyboard();
  },
  openPost() { this.selectComponent("#pd").open(); },
  goCircleR(e) { wx.navigateTo({ url: "/pages/circle-detail/circle-detail?key=" + e.currentTarget.dataset.k }); },
  goUserR(e) {
    const name = e.currentTarget.dataset.name;
    if (name === "林青云") { wx.navigateTo({ url: "/pages/mine/mine" }); return; }
    wx.navigateTo({ url: "/pages/user/user?name=" + encodeURIComponent(name) });
  },
  goRes(e) { wx.navigateTo({ url: "/pages/resource-detail/resource-detail?id=" + e.currentTarget.dataset.id }); },
  goChk(e) { wx.navigateTo({ url: "/pages/checkin-detail/checkin-detail?id=" + e.currentTarget.dataset.id }); },
  goMine() { wx.navigateTo({ url: "/pages/mine/mine" }); },
  goQa(e) { wx.navigateTo({ url: "/pages/qa/qa?key=" + e.currentTarget.dataset.k }); },
  tip(e) { this._toast(e.currentTarget.dataset.t); },
  onCompTip(e) { this._toast(e.detail.msg); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
