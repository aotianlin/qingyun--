const { RESOURCES, PREVIEW_TEXT, RELATED } = require("../../data/resources.js");

Page({
  data: {
    sb: 52,
    navHide: false,
    r: null,
    preview: PREVIEW_TEXT,
    related: RELATED,
    fav: false,
    downloading: false,
    downloaded: false,
    toastShow: false,
    toastMsg: ""
  },
  onLoad(options) {
    this.setData({ sb: getApp().globalData.sbTop });
    const r = RESOURCES.find(x => x.id === Number(options.id || 1)) || RESOURCES[0];
    this.setData({ r });
  },
  toggleFav() {
    this.setData({ fav: !this.data.fav });
    this._toast(this.data.fav ? "已收藏" : "已取消收藏");
  },
  // 真实下载流程：准备中 → 完成态；后端就绪后替换为 getDownloadUrl + downloadFile
  download() {
    if (this.data.downloading) return;
    if (this.data.downloaded) { this._toast("已下载，可在「我的资料」查看"); return; }
    this.setData({ downloading: true });
    wx.showLoading({ title: "正在准备下载", mask: true });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ downloading: false, downloaded: true });
      this._toast("下载完成，已保存到本地");
    }, 900);
  },
  goRelated(e) { wx.redirectTo({ url: "/pages/resource-detail/resource-detail?id=" + e.currentTarget.dataset.id }); },
  onPageSc(e) {
    const st = e.detail.scrollTop;
    const last = this._lastSt || 0;
    if (Math.abs(st - last) < 2) return;
    this._lastSt = st;
    // 只有 nav-hide 真的翻转才下发：滚动中每帧 setData 会让样式重算跑满 60fps
    const hide = st > 80 && st > last;
    if (hide !== this.data.navHide) this.setData({ navHide: hide });
  },
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/resources/resources" }) }); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
