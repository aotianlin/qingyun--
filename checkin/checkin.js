const { CHALLENGES, CATS } = require("../../data/checkin.js");

Page({
  data: {
    sb: 52,
    navHide: false,
    celebrate: false,
    cats: CATS,
    cat: "全部",
    mine: [],
    all: [],
    done: 0,
    total: 0,
    streak: 4,
    toastShow: false,
    toastMsg: ""
  },
  onLoad() {
    this.setData({ sb: getApp().globalData.sbTop, mine: CHALLENGES.slice(0, 3), all: CHALLENGES });
    this.refreshCount();
  },
  refreshCount() {
    const mine = this.data.mine;
    this.setData({ done: mine.filter(c => c.today === "done").length, total: mine.length });
  },
  onCat(e) {
    const cat = e.currentTarget.dataset.c;
    this.setData({ cat, all: cat === "全部" ? CHALLENGES : CHALLENGES.filter(c => c.cat === cat) });
  },
  goDetail(e) { wx.navigateTo({ url: "/pages/checkin-detail/checkin-detail?id=" + e.currentTarget.dataset.id }); },
  goCreate() { wx.navigateTo({ url: "/pages/checkin-create/checkin-create" }); },
  quickCheckin(e) {
    const id = e.currentTarget.dataset.id;
    // 原型：checkin(id)
    this.setData({ celebrate: true });
    clearTimeout(this._ct);
    this._ct = setTimeout(() => this.setData({ celebrate: false }), 2200);
  },
  closeCelebrate() { this.setData({ celebrate: false }); },
  noop() {},
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
