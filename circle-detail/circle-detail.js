const { CIRCLES, CD_THUMB } = require("../../data/circles.js");

Page({
  data: {
    sb: 52,
    navHide: false, cd: null, cdTab: "feed", toastShow: false, toastMsg: "" },
  onLoad(options) {
    this.setData({ sb: getApp().globalData.sbTop });
    this._k = options.key || "algo";
    this.renderCircle();
  },
  renderCircle() {
    const c = CIRCLES[this._k];
    const chk = c.chk.map(x => ({ name: x[0], cur: x[1], total: x[2], meta: x[3], ring: "ring-r" + x[1] + "-" + x[2] + "-g" }));
    this.setData({
      cd: {
        name: c.name, ch: c.ch, bg: c.bg, desc: c.desc, stats: c.stats, joined: c.joined,
        feed: c.feed, res: c.res, chk, emptyChk: !c.chk.length
      },
      cdTab: this.data.cd ? this.data.cdTab : "feed"
    });
    wx.setNavigationBarTitle && wx.setNavigationBarTitle({ title: c.name });
  },
  onCdTab(e) { this.setData({ cdTab: e.currentTarget.dataset.t }); },
  onCdJoin() {
    const c = CIRCLES[this._k];
    if (!c.joined) {
      c.joined = true;
      wx.showToast({ title: "已加入「" + c.name + "」", icon: "none" });
      this.renderCircle();
    } else {
      this.setData({ cdTab: "chk" });
    }
  },
  thumbOf(kind) { return CD_THUMB[kind] || CD_THUMB.doc; },
  // 动态按类型分流：资料→资料广场，打卡→打卡列表，其余→帖子详情
  goFeed(e) {
    const kind = e.currentTarget.dataset.kind;
    if (kind === "doc") { wx.navigateTo({ url: "/pages/resources/resources" }); return; }
    if (kind === "chk") { wx.navigateTo({ url: "/pages/checkin/checkin" }); return; }
    this.selectComponent("#pd").open();
  },
  goRes() { wx.navigateTo({ url: "/pages/resources/resources" }); },
  goChk() { wx.navigateTo({ url: "/pages/checkin/checkin" }); },
  onCompTip(e) { this._toast(e.detail.msg); },
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
  tip(e) { this._toast(e.currentTarget.dataset.t); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
