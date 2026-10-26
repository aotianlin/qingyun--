// 互动消息（赞/评论/关注）——原型 NTS 逐字迁移
const NTS = {
  like: [
    { ch: "周", bg: "#FFF3DC", fg: "#B26A00", who: "周晓", act: "赞了你的动态", what: "周五晚霞收容所｜宿舍楼天台实拍", tm: "12 分钟前", thumb: "sunset", goDetail: true },
    { ch: "陈", bg: "#DCE9E9", fg: "#0F454F", who: "陈思远、林青云、苏墨 等 5 人", act: "赞了你的动态", what: "单调栈三连的通用套路", tm: "2 小时前", thumb: "code" },
    { ch: "王", bg: "#E9EBFA", fg: "#3641C4", who: "王立", act: "赞了你的资料", what: "数据结构期末复习思维导图", tm: "昨天 21:04", thumb: "pdf" }
  ],
  comment: [
    { ch: "李", bg: "#DCE9E9", fg: "#0F454F", who: "李想", act: "评论了你的提问", what: "「建议先去旁听一节中级会计再决定」", tm: "35 分钟前", re: "回复" },
    { ch: "周", bg: "#FFF3DC", fg: "#B26A00", who: "周晓", act: "评论了你的动态", what: "「这个机位周末去试试！」", tm: "2 小时前", re: "回复", goDetail: true },
    { ch: "陈", bg: "#DCE9E9", fg: "#0F454F", who: "陈思远", act: "回复了你的评论", what: "「周五分享会见，我把题解带上」", tm: "昨天 18:22", re: "回复" }
  ],
  follow: [
    { ch: "苏", bg: "#FFFFFF", fg: "#5C6B64", border: true, who: "苏墨", act: "关注了你", what: "经济学院 · 你们都在「论文互助圈」", tm: "1 小时前", follow: true, followed: false },
    { ch: "李", bg: "#DCE9E9", fg: "#0F454F", who: "李想", act: "关注了你", what: "会计学院 · 回答过你的提问", tm: "昨天", follow: true, followed: false },
    { ch: "郑", bg: "#FFF3DC", fg: "#B26A00", who: "郑雨桐", act: "关注了你", what: "会计学院 · 3 个共同圈子", tm: "周四", follow: true, followed: true }
  ]
};

Page({
  data: {
    sb: 52,
    navHide: false,
    tab: "like",
    tabs: [["like", "赞"], ["comment", "评论"], ["follow", "关注"]],
    rows: [],
    detailOpen: false,
    toastShow: false,
    toastMsg: ""
  },
  onLoad(options) {
    this.setData({ sb: getApp().globalData.sbTop });
    const tab = options.kind || "like";
    this.setData({ tab, rows: NTS[tab].map(n => Object.assign({}, n)) });
  },
  onTab(e) {
    const tab = e.currentTarget.dataset.t;
    this.setData({ tab, rows: NTS[tab].map(n => Object.assign({}, n)) });
  },
  toggleFollow(e) {
    const i = e.currentTarget.dataset.i;
    const key = "rows[" + i + "].followed";
    const upd = {};
    upd[key] = !this.data.rows[i].followed;
    this.setData(upd);
    this._toast(upd[key] ? "已回关" : "已取消关注");
  },
  // 回复：打开帖子详情并把光标落到评论框
  reply() { this.selectComponent("#pd").openComment(); },
  rowTap() { this.selectComponent("#pd").open(); },
  closeDetail() { this.selectComponent("#pd").close(); },
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
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/messages/messages" }) }); },
  tip(e) { this._toast(e.currentTarget.dataset.t); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
