Page({
  data: {
    sb: 52,
    file: null,          // { name, size, ext }
    detect: null,        // AI 课程识别 { course, ok }
    courses: ["数据结构", "操作系统", "计算机网络", "考研数学", "英语", "微观经济学"],
    scope: "public",     // public | circle | private
    scopes: [["public", "公开"], ["circle", "圈内可见"], ["private", "仅自己"]],
    desc: "",
    submitting: false,
    toastShow: false,
    toastMsg: ""
  },
  onLoad() { this.setData({ sb: getApp().globalData.sbTop }); },
  chooseFile() {
    wx.chooseMessageFile({
      count: 1, type: "file",
      success: res => {
        const f = res.tempFiles[0];
        const name = f.name || "未命名文件";
        const ext = (name.split(".").pop() || "").toUpperCase().slice(0, 4);
        this.setData({
          file: { name, size: this.fmtSize(f.size), ext: ext || "FILE" },
          detect: null
        });
        // 原型：aiRecommendTags 识别课程
        const that = this;
        setTimeout(() => that.setData({ detect: { course: "数据结构", chapter: "期末复习" } }), 800);
      }
    });
  },
  fmtSize(n) {
    if (n > 1048576) return (n / 1048576).toFixed(1) + " MB";
    if (n > 1024) return (n / 1024).toFixed(0) + " KB";
    return n + " B";
  },
  // 手动改课程：选择器直接改写入识别结果
  onCourse(e) {
    const i = Number(e.detail.value);
    this.setData({ "detect.course": this.data.courses[i] });
    this._toast("已改为「" + this.data.courses[i] + "」");
  },
  onScope(e) { this.setData({ scope: e.currentTarget.dataset.v }); },
  onDesc(e) { this.setData({ desc: e.detail.value }); },
  canSubmit() { return !!this.data.file && !this.data.submitting; },
  submit() {
    if (!this.canSubmit()) return;
    this.setData({ submitting: true });
    setTimeout(() => {
      this.setData({ submitting: false });
      wx.showToast({ title: "资料已上传", icon: "success" });
      setTimeout(() => wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/discover/discover" }) }), 900);
    }, 900);
  },
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/discover/discover" }) }); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
