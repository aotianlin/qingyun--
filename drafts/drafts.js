const ME = require("../../data/me.js").ME;

function fmtTime(ts) {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return Math.floor(diff / 60000) + " 分钟前";
  const d = new Date(ts);
  const hh = ("0" + d.getHours()).slice(-2);
  const mm = ("0" + d.getMinutes()).slice(-2);
  if (d.toDateString() === new Date(now).toDateString()) return "今天 " + hh + ":" + mm;
  return d.getMonth() + 1 + " 月 " + d.getDate() + " 日 " + hh + ":" + mm;
}

Page({
  data: {
    sb: 52,
    navHide: false,
    me: ME,
    list: [],
    toastShow: false,
    toastMsg: ""
  },
  onLoad() { this.setData({ sb: getApp().globalData.sbTop }); },
  onShow() { this.render(); },
  render() {
    const raw = wx.getStorageSync("qd_drafts") || [];
    const list = raw
      .slice()
      .sort((a, b) => (b.at || 0) - (a.at || 0))
      .map(d => ({
        id: d.id,
        typeLabel: d.mode === "qa" ? "提问" : "动态",
        excerpt: (d.content || "").trim() || (d.imageCount ? "（" + d.imageCount + " 张图片，还没写文字）" : "（空草稿）"),
        topics: d.topics || [],
        time: fmtTime(d.at || Date.now())
      }));
    this.setData({ list });
  },
  openDraft(e) {
    const d = (wx.getStorageSync("qd_drafts") || []).find(x => String(x.id) === String(e.currentTarget.dataset.id));
    if (!d) return;
    wx.navigateTo({ url: "/pages/post-create/post-create?mode=" + (d.mode || "post") + "&draftId=" + d.id });
  },
  removeDraft(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "删除草稿",
      content: "删除后不可恢复，确定删除？",
      confirmColor: "#FF5A5A",
      success: (r) => {
        if (!r.confirm) return;
        wx.setStorageSync("qd_drafts", (wx.getStorageSync("qd_drafts") || []).filter(d => String(d.id) !== String(id)));
        this.render();
        this._toast("草稿已删除");
      }
    });
  },
  clearAll() {
    wx.showModal({
      title: "清空草稿箱",
      content: "将删除全部 " + this.data.list.length + " 篇草稿，确定继续？",
      confirmColor: "#FF5A5A",
      success: (r) => {
        if (!r.confirm) return;
        wx.removeStorageSync("qd_drafts");
        this.render();
        this._toast("草稿箱已清空");
      }
    });
  },
  goCreate() { wx.navigateTo({ url: "/pages/post-create/post-create?mode=post" }); },
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
