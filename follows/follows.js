Page({
  data: {
    sb: 52,
    navHide: false,
    tab: "following",
    rows: [
      { ch: "陈", bg: "#DCE9E9", fg: "#0F454F", name: "陈思远", bio: "计算机学院 · 算法自习室", mutual: true, following: true },
      { ch: "周", bg: "#FFF3DC", fg: "#B26A00", name: "周晓", bio: "艺术学院 · 摄影小组", mutual: false, following: true },
      { ch: "苏", bg: "#FFFFFF", fg: "#5C6B64", border: true, name: "苏墨", bio: "经济学院 · 论文互助圈", mutual: true, following: true },
      { ch: "李", bg: "#DCE9E9", fg: "#0F454F", name: "李想", bio: "会计学院", mutual: false, following: false }
    ],
    toastShow: false,
    toastMsg: ""
  },
  onLoad() { this.setData({ sb: getApp().globalData.sbTop }); },
  onTab(e) { this.setData({ tab: e.currentTarget.dataset.t }); },
  toggle(e) {
    const i = e.currentTarget.dataset.i;
    const key = "rows[" + i + "].following";
    const upd = {};
    upd[key] = !this.data.rows[i].following;
    this.setData(upd);
    this._toast(upd[key] ? "已关注" : "已取消");
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
