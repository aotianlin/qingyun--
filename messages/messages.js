Page({
  data: {
    sb: 52,
    convs: [
      { k: "chen", ch: "陈", bg: "#DCE9E9", fg: "#0F454F", name: "陈思远", tm: "周五", msg: "顺便问下，周五的题解分享会你去吗？", unread: 1 },
      { k: "zhou", ch: "周", bg: "#FFF3DC", fg: "#B26A00", name: "周晓", tm: "周五", msg: "收到！周末去试试机位", unread: 2 },
      { k: "wang", ch: "王", bg: "#4353D9", fg: "#fff", name: "王立", tm: "周五", msg: "分享会记得把单调栈的例子带上。", unread: 1 },
      { k: "su", ch: "苏", bg: "#FFFFFF", fg: "#5B6B63", border: true, name: "苏墨", tm: "周四", msg: "文献综述模板用起来了，请你看奶茶", unread: 0 }
    ],
    hasUnread: true,
    toastShow: false,
    toastMsg: ""
  },
  onLoad() { this.setData({ sb: getApp().globalData.sbTop }); },
  readAll() {
    if (!this.data.hasUnread) { this._toast("没有未读私信"); return; }
    this.setData({
      convs: this.data.convs.map(c => Object.assign({}, c, { unread: 0 })),
      hasUnread: false
    });
    this._toast("已全部标记为已读");
  },
  goNt(e) { wx.navigateTo({ url: "/pages/notifications/notifications?kind=" + e.currentTarget.dataset.k }); },
  goDM(e) { wx.navigateTo({ url: "/pages/dm/dm?key=" + e.currentTarget.dataset.k }); },
  tip(e) { this._toast(e.currentTarget.dataset.t); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
