const { RESOURCES } = require("../../data/resources.js");

Page({
  data: { sb: 52, navHide: false, list: [] },
  onLoad() {
    this.setData({
      sb: getApp().globalData.sbTop,
      list: RESOURCES.slice(0, 3).map(r => ({ id: r.id, ext: r.ext, amber: r.amber, name: r.name, meta: r.meta + " · 累计被下载 504 次" }))
    });
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
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/mine/mine" }) }); },
  goDetail(e) { wx.navigateTo({ url: "/pages/resource-detail/resource-detail?id=" + e.currentTarget.dataset.id }); },
  tip(e) { wx.showToast({ title: e.currentTarget.dataset.t, icon: "none" }); }
});
