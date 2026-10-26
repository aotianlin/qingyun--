Page({
  data: {
    sb: 52,
    covers: ["#175A67", "#0F454F", "#B26A00", "#3641C4", "#E8960C", "#5C6B64"],
    cover: "#175A67",
    name: "",
    cat: "学习",
    cats: ["学习", "考研", "生活", "兴趣"],
    desc: "",
    toastShow: false,
    toastMsg: ""
  },
  onLoad() { this.setData({ sb: getApp().globalData.sbTop }); },
  pickCover(e) { this.setData({ cover: e.currentTarget.dataset.c }); },
  onName(e) { this.setData({ name: e.detail.value }); },
  onCat(e) { this.setData({ cat: e.currentTarget.dataset.c }); },
  onDesc(e) { this.setData({ desc: e.detail.value }); },
  canSubmit() { return this.data.name.trim().length >= 2; },
  submit() {
    if (!this.canSubmit()) { this._toast("圈子名至少 2 个字"); return; }
    wx.showToast({ title: "圈子创建成功", icon: "success" });
    setTimeout(() => wx.redirectTo({ url: "/pages/circles/circles" }), 900);
  },
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/circles/circles" }) }); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
