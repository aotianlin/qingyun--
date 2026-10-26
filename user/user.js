// 他人主页：按姓名取人，缺省为王立
const PEOPLE = {
  "周晓": { ch: "周", bg: "#FFF3DC", fg: "#B26A00", heroBg: "#B26A00", dep: "艺术学院 · 视觉传达 · 大三", bio: "蹲天台等晚霞的人。", key: "zhou" },
  "陈思远": { ch: "陈", bg: "#D9E7E8", fg: "#0F454F", heroBg: "#0F454F", dep: "计算机学院 · 软件工程 · 大二", bio: "组队必带三脚架。", key: "chen" },
  "王立": { ch: "王", bg: "#E9EBFA", fg: "#3641C4", heroBg: "#3641C4", dep: "电气学院 · 研二", bio: "分享会记得把单调栈的例子带上。", key: "wang" },
  "苏墨": { ch: "苏", bg: "#FFFFFF", fg: "#5C6B64", heroBg: "#12333B", dep: "文学院 · 汉语言 · 大三", bio: "读书会常驻，偏爱非虚构。", key: "su" }
};

Page({
  data: {
    sb: 52,
    navHide: false,
    name: "王立",
    ch: "王",
    bg: "#E9EBFA",
    heroBg: "#3641C4",
    fg: "#3641C4",
    dep: "电气学院 · 研二",
    bio: "分享会记得把单调栈的例子带上。",
    key: "wang",
    tab: "post",
    following: false,
    posts: [
      { title: "单调栈三连的通用套路：哨兵与边界一次讲透", meta: "61 赞 · 9 评论 · 算法自习室" },
      { title: "AcWing 春季讲义（圈内整理）", meta: "34 赞 · 资料" }
    ],
    resources: [
      { ext: "PDF", amber: false, name: "数据结构期末复习思维导图", meta: "328 次下载 · v2" }
    ],
    checkins: [
      { name: "每日算法打卡", ring: "ring-r9-30-g", meta: "128 人 · 已坚持 9 天" }
    ],
    toastShow: false,
    toastMsg: ""
  },
  onLoad(options) {
    this.setData({ sb: getApp().globalData.sbTop });
    const name = options.name ? decodeURIComponent(options.name) : "王立";
    const p = PEOPLE[name] || PEOPLE["王立"];
    this.setData({ name: PEOPLE[name] ? name : "王立", ch: p.ch, bg: p.bg, fg: p.fg, dep: p.dep, bio: p.bio, key: p.key, heroBg: p.heroBg || "#12333B" });
  },
  goDm() {
    wx.navigateTo({ url: "/pages/dm/dm?key=" + this.data.key + "&name=" + encodeURIComponent(this.data.name) });
  },
  onTab(e) { this.setData({ tab: e.currentTarget.dataset.t }); },
  toggleFollow() {
    this.setData({ following: !this.data.following });
    this._toast(this.data.following ? "已关注 " + this.data.name : "已取消关注");
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
