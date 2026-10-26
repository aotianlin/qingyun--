const POSTS = [
  { icon: "📷", bg: "#FDF3E3", title: "周五晚霞收容所｜宿舍楼天台实拍", meta: "286 赞 · 42 评论", kind: "post" },
  { icon: "？", bg: "#E9EBFA", title: "宿舍限电 800W，台式机到底能不能带？", meta: "38 人已答 · 问答", kind: "qa" }
];

Page({
  data: { sb: 52, navHide: false, list: [], toastShow: false, toastMsg: "" },
  onLoad() { this.setData({ sb: getApp().globalData.sbTop, list: POSTS }); },
  // 问答类跳到问答详情，动态类打开帖子详情
  openItem(e) {
    if (e.currentTarget.dataset.kind === "qa") {
      wx.navigateTo({ url: "/pages/qa/qa?key=xiandian" });
      return;
    }
    this.selectComponent("#pd").open();
  },
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
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/mine/mine" }) }); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
