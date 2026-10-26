// 私信（iMessage 风）——原型 DMS 逐字迁移
const { ME } = require("../../data/me.js");
const DMS = {
  chen: { name: "陈思远", ch: "陈", bg: "#DCE9E9", fg: "#0F454F", border: false, date: "周五 20:32", read: false, msgs: [
    { side: "in", t: "单调栈的笔记发我一份呗，明天想复盘" },
    { side: "out", t: "已发你圈子资料那份 v2，带真题标注" },
    { side: "in", t: "完美！顺便问下，周五的题解分享会你去吗？" }
  ] },
  zhou: { name: "周晓", ch: "周", bg: "#FFF3DC", fg: "#B26A00", border: false, date: "周五 18:05", read: true, msgs: [
    { side: "in", t: "收到！周末去试试机位" },
    { side: "out", t: "记得带长焦，六点半那场最好看" }
  ] },
  wang: { name: "王立", ch: "王", bg: "#4353D9", fg: "#fff", border: false, date: "周五 16:40", read: true, msgs: [
    { side: "in", t: "分享会记得把单调栈的例子带上。" },
    { side: "out", t: "好嘞，PPT 已经放进圈子资料了" }
  ] },
  su: { name: "苏墨", ch: "苏", bg: "#FFFFFF", fg: "#5C6B64", border: true, date: "周四 21:12", read: true, msgs: [
    { side: "in", t: "文献综述模板用起来了，请你看奶茶" },
    { side: "out", t: "哈哈成交，三分糖" }
  ] }
};

Page({
  data: {
    sb: 52,
    kbH: 0,
    me: ME,
    dm: null,
    draft: "",
    scrollInto: "",
    toastShow: false,
    toastMsg: ""
  },
  onLoad(options) {
    this.setData({ sb: getApp().globalData.sbTop });
    let d = DMS[options.key];
    // 从任意用户主页发起私信：没有历史会话时按姓名开一个新会话
    if (!d && options.name) {
      const name = decodeURIComponent(options.name);
      d = {
        name, ch: name.slice(0, 1), bg: "#DCE9E9", fg: "#0F454F",
        border: false, date: "刚刚", read: true,
        msgs: [{ side: "in", t: "你好，我是" + name + "，有什么想聊的？" }]
      };
    }
    d = d || DMS.chen;
    this.setData({ dm: d, scrollInto: "m" + (d.msgs.length - 1) });
  },
  onDraft(e) { this.setData({ draft: e.detail.value }); },
  send() {
    const v = (this.data.draft || "").trim();
    if (!v) { this._toast("说点什么吧"); return; }
    this._append({ side: "out", t: v });
    this.setData({ draft: "" });
  },
  // 选图后作为图片消息发出
  chooseImg() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: (res) => {
        if (res.tempFiles && res.tempFiles.length) this._append({ side: "out", img: res.tempFiles[0].tempFilePath });
      }
    });
  },
  _append(msg) {
    const dm = Object.assign({}, this.data.dm, { msgs: this.data.dm.msgs.concat([msg]) });
    this.setData({ dm, scrollInto: "m" + (dm.msgs.length - 1) });
  },
  onKb(e) {
    this.setData({ kbH: e.detail.height || 0 });
    if (this.data.kbH > 0 && this.data.dm && this.data.dm.msgs) this.setData({ scrollInto: "m" + (this.data.dm.msgs.length - 1) });
  },
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/messages/messages" }) }); },
  tip(e) { this._toast(e.currentTarget.dataset.t); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
