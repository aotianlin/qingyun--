Component({
  options: { styleIsolation: "apply-shared" },
  data: {
    kbH: 0,
    show: false, sb: 52, scrolled: false,
    liked: false, faved: false, likeNum: 286, likePop: false,
    comments: [
      { ch: "林", bg: "#D9E7E8", fg: "#0F454F", name: "林青云", t: "13 小时前", text: "第三张的光影绝了，用的什么卷？", likeNum: 12 },
      { ch: "陈", bg: "#FFF3DC", fg: "#B26A00", name: "陈思远", t: "11 小时前", text: "下周一求组队，我带三脚架。", likeNum: 5 }
    ],
    commentTotal: 42,
    draft: "",
    replyTo: "",
    focusComment: false
  },
  attached() {
    const app = getApp();
    const sb = (app && app.globalData && app.globalData.sbTop) || 52;
    this.setData({ sb });
  },
  methods: {
    open() { this.setData({ show: true, scrolled: false, focusComment: false, replyTo: "" }); },
    // 从「回复」入口进入时直接把光标落到评论框
    openComment() { this.setData({ show: true, scrolled: false, focusComment: true }); },
    close() { this.setData({ show: false, focusComment: false }); },
    onKb(e) { this.setData({ kbH: e.detail.height || 0 }); },
    onAfterLeave() {},
    // 吸顶栏明暗翻转：滚过头图（464rpx≈232px）阈值 180px 处切换，500ms 过渡
    onScroll(e) {
      const s = e.detail.scrollTop > 180;
      if (s !== this.data.scrolled) this.setData({ scrolled: s });
    },
    toggleLike() {
      const liked = !this.data.liked;
      this.setData({ liked, likeNum: this.data.likeNum + (liked ? 1 : -1), likePop: false });
      setTimeout(() => this.setData({ likePop: true }), 20);
      clearTimeout(this._pt);
      this._pt = setTimeout(() => this.setData({ likePop: false }), 240);
    },
    toggleFav() { this.setData({ faved: !this.data.faved }); },
    // 评论点赞：对应 V1 POST /comments/{id}/reactions（type=LIKE）；Mock 阶段本地先行
    likeComment(e) {
      const i = e.currentTarget.dataset.index;
      const c = this.data.comments[i];
      if (!c) return;
      const liked = !c.liked;
      this.setData({
        ["comments[" + i + "].liked"]: liked,
        ["comments[" + i + "].likeNum"]: Math.max(0, (c.likeNum || 0) + (liked ? 1 : -1))
      });
    },
    onDraft(e) { this.setData({ draft: e.detail.value }); },
    // 点「回复」：记住被回复的人，光标落到输入框
    replyTo(e) {
      this.setData({ replyTo: e.currentTarget.dataset.name, focusComment: false });
      setTimeout(() => this.setData({ focusComment: true }), 30);
    },
    sendComment() {
      const v = (this.data.draft || "").trim();
      if (!v) { this._toast("先写点什么吧"); return; }
      const rec = { ch: "林", bg: "#D9E7E8", fg: "#0F454F", name: "林青云", t: "刚刚", text: v, likeNum: 0 };
      if (this.data.replyTo) rec.to = this.data.replyTo;
      this.setData({
        comments: this.data.comments.concat([rec]),
        commentTotal: this.data.commentTotal + 1,
        draft: "",
        replyTo: ""
      });
      this._toast("评论已发布");
    },
    openAuthor() { this.openUser({ currentTarget: { dataset: { name: "周晓" } } }); },
    // 头像 / 昵称 → 他人主页；点到自己时提示
    openUser(e) {
      const name = e.currentTarget.dataset.name;
      if (name === "林青云") { this._toast("这是你自己的主页"); return; }
      wx.navigateTo({ url: "/pages/user/user?name=" + encodeURIComponent(name) });
    },
    dmAuthor() {
      wx.navigateTo({ url: "/pages/dm/dm?key=zhou&name=" + encodeURIComponent("周晓") });
    },
    share() {
      wx.showActionSheet({
        itemList: ["复制帖子链接", "转发给好友"],
        success: (res) => {
          if (res.tapIndex === 0) {
            wx.setClipboardData({ data: "https://qingyun.app/post/1", success: () => this._toast("链接已复制") });
          } else {
            this._toast("点右上角「···」转发给好友");
          }
        }
      });
    },
    tip(e) { this.triggerEvent("tip", { msg: e.currentTarget.dataset.t }); },
    _toast(msg) { this.triggerEvent("tip", { msg }); },
    noop() {}
  }
});
