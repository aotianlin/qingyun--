Page({
  data: {
    sb: 52,
    mode: "login",          // login | register | forgot
    email: "",
    password: "",
    code: "",
    codeBtn: "获取验证码",
    codeBusy: false,
    toastShow: false,
    toastMsg: ""
  },
  onLoad(options) {
    const mode = options.mode === "forgot" ? "forgot" : (options.mode === "register" ? "register" : "login");
    this.setData({ sb: getApp().globalData.sbTop, mode });
  },
  switchMode(e) { this.setData({ mode: e.currentTarget.dataset.m }); },
  onEmail(e) { this.setData({ email: e.detail.value }); },
  onPwd(e) { this.setData({ password: e.detail.value }); },
  onCode(e) { this.setData({ code: e.detail.value }); },
  sendCode() {
    if (this.data.codeBusy) return;
    if (!this.data.email.includes("@")) { this._toast("先输入邮箱"); return; }
    this.setData({ codeBusy: true });
    let n = 60;
    const tick = setInterval(() => {
      n--;
      this.setData({ codeBtn: n + "s 后重发" });
      if (n <= 0) { clearInterval(tick); this.setData({ codeBusy: false, codeBtn: "获取验证码" }); }
    }, 1000);
  },
  // 真实调用 wx.login 换取登录 code（后端就绪后在此换成 code2Session）
  wxLogin() {
    if (this._wxLogging) return;
    this._wxLogging = true;
    wx.login({
      success: (res) => {
        this._wxLogging = false;
        if (!res.code) { this._toast("微信登录失败，请重试"); return; }
        wx.setStorageSync("qd_wx_code", res.code);
        wx.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/discover/discover" }) }), 900);
      },
      fail: () => { this._wxLogging = false; this._toast("微信登录失败，请重试"); }
    });
  },
  submit() {
    const m = this.data.mode;
    const t = m === "login" ? "登录成功" : (m === "register" ? "注册成功，已自动登录" : "密码已重置");
    wx.showToast({ title: t, icon: "success" });
    setTimeout(() => wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/discover/discover" }) }), 900);
  },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
