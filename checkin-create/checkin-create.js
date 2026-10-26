Page({
  data: {
    sb: 52,
    name: "",
    goal: "",
    periods: [7, 14, 21, 30],
    period: 21,
    remind: "22:00",
    scope: "public",
    scopes: [["public", "公开"], ["circle", "圈内"]],
    aiBusy: false,
    aiSuggest: "",
    toastShow: false,
    toastMsg: ""
  },
  onLoad() { this.setData({ sb: getApp().globalData.sbTop }); },
  onName(e) { this.setData({ name: e.detail.value }); },
  onGoal(e) { this.setData({ goal: e.detail.value }); },
  onPeriod(e) { this.setData({ period: Number(e.currentTarget.dataset.p) }); },
  onRemind(e) { this.setData({ remind: e.detail.value }); },
  onScope(e) { this.setData({ scope: e.currentTarget.dataset.v }); },
  aiSuggestFlow() {
    const seed = this.data.name.trim() || "背单词";
    this.setData({ aiBusy: true });
    setTimeout(() => {
      this.setData({
        aiBusy: false,
        aiSuggest: "已按「" + seed + "」生成节奏：每天定量 30 分钟，漏卡当天 " + this.data.remind + " 提醒，最多补卡 1 次",
        goal: "每天 " + seed + " 30 分钟"
      });
    }, 900);
  },
  canSubmit() { return this.data.name.trim().length > 0; },
  submit() {
    if (!this.canSubmit()) { this._toast("先给挑战起个名字"); return; }
    wx.showToast({ title: "挑战已发起", icon: "success" });
    setTimeout(() => wx.redirectTo({ url: "/pages/checkin/checkin" }), 900);
  },
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/checkin/checkin" }) }); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
