const { CHALLENGES, TIMELINE } = require("../../data/checkin.js");

const MORE = [
  { ch: "周", bg: "#FFF3DC", fg: "#B26A00", who: "周晓", tm: "昨天 21:40", text: "第 8 天，今天把滑动窗口重写了一遍，比昨天顺" },
  { ch: "郑", bg: "#FFF3DC", fg: "#B26A00", who: "郑雨桐", tm: "昨天 20:12", text: "并查集路径压缩 + 按秩合并，两个都加上了" }
];

Page({
  data: {
    sb: 52,
    navHide: false,
    c: null,
    timeline: TIMELINE,
    hasMore: true,
    toastShow: false,
    toastMsg: ""
  },
  onLoad(options) {
    this.setData({ sb: getApp().globalData.sbTop });
    const c = CHALLENGES.find(x => x.id === Number(options.id || 1)) || CHALLENGES[0];
    this.setData({ c: Object.assign({}, c, { today: "todo" }) });
  },
  doCheckin() {
    const c = this.data.c;
    this.setData({ "c.today": "done", "c.cur": c.cur + 1 });
    this._toast("打卡成功！坚持第 " + (c.cur + 1) + " 天 🔥");
  },
  loadMore() {
    if (!this.data.hasMore) return;
    this.setData({ timeline: this.data.timeline.concat(MORE), hasMore: false });
  },
  // 真实转发：点「分享战绩」唤起微信转发面板
  onShareAppMessage() {
    const c = this.data.c || {};
    return {
      title: "我在青云坚持「" + c.name + "」第 " + c.cur + " 天，一起来打卡",
      path: "/pages/checkin-detail/checkin-detail?id=" + (c.id || 1)
    };
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
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/checkin/checkin" }) }); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
