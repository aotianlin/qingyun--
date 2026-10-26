const { ME } = require("../../data/me.js");

const DEFAULTS = {
  like: true,      // 点赞与收藏通知
  comment: true,   // 评论与回复通知
  follow: true,    // 新增关注通知
  dm: true,        // 私信通知
  dmScope: 0,      // 谁能私信我
  favScope: 1,     // 谁能看我的收藏
  online: true     // 展示在线状态
};
const DM_SCOPES = ["所有人", "仅圈子成员", "仅我关注的人"];
const FAV_SCOPES = ["所有人", "仅关注我的人", "仅自己"];

const ABOUT = {
  terms: {
    title: "用户协议",
    body: [
      "一、服务内容",
      "青云为校园学习社区，提供动态、问答、资料共享、打卡挑战与 AI 学伴服务。你在平台发布的内容须真实、合法，不得侵犯他人权益。",
      "二、账号与身份",
      "账号仅限本校学生使用，请勿转让。因个人保管不当造成的损失由账号持有人承担。",
      "三、内容规范",
      "禁止发布违法、侵权、广告、人身攻击等内容。违规内容将被下架，情节严重者封禁账号。",
      "四、知识产权",
      "你发布的内容版权归你所有；你授权平台在校内范围内展示与传播。转载他人内容请注明来源。",
      "五、免责声明",
      "平台内资料由同学共享，仅供参考，不构成教学或考试承诺。"
    ]
  },
  privacy: {
    title: "隐私政策",
    body: [
      "一、我们收集的信息",
      "为提供服务，我们会收集你的微信登录标识、昵称、头像、学院专业信息，以及你主动发布的内容。",
      "二、信息的使用",
      "上述信息仅用于账号识别、内容展示与社区治理，不会用于商业广告推送。",
      "三、信息的共享",
      "除法律法规要求外，我们不会向第三方提供你的个人信息。",
      "四、你的权利",
      "你可以随时在「设置 - 隐私」中调整可见范围，也可以在「意见反馈」中申请删除账号数据。",
      "五、本地存储",
      "草稿、通知偏好、隐私选项保存在本机，退出登录时会清除登录态，草稿需自行备份。"
    ]
  }
};

function readSettings() {
  const s = wx.getStorageSync("qd_settings") || {};
  return Object.assign({}, DEFAULTS, s);
}

Page({
  data: {
    sb: 52,
    navHide: false,
    me: ME,
    settings: DEFAULTS,
    dmScopes: DM_SCOPES,
    favScopes: FAV_SCOPES,
    version: "1.0.0",
    cacheText: "0 KB",
    docOpen: false,
    docTitle: "",
    docBody: [],
    toastShow: false,
    toastMsg: ""
  },
  onLoad() {
    this.setData({ sb: getApp().globalData.sbTop, settings: readSettings(), version: this._version(), cacheText: this._cacheText() });
  },
  _version() {
    try {
      const info = wx.getAccountInfoSync && wx.getAccountInfoSync();
      const v = info && info.miniProgram && info.miniProgram.version;
      return v || "1.0.0";
    } catch (e) { return "1.0.0"; }
  },
  _cacheText() {
    try {
      const size = wx.getStorageInfoSync().currentSize; // KB
      return size >= 1024 ? (size / 1024).toFixed(1) + " MB" : size + " KB";
    } catch (e) { return "—"; }
  },
  _calcCache() { this.setData({ cacheText: this._cacheText() }); },
  _save() { wx.setStorageSync("qd_settings", this.data.settings); },

  onSwitch(e) {
    const k = e.currentTarget.dataset.k;
    this.setData({ ["settings." + k]: e.detail.value });
    this._save();
  },
  onDmScope(e) {
    this.setData({ "settings.dmScope": Number(e.detail.value) });
    this._save();
    this._toast("私信权限已更新");
  },
  onFavScope(e) {
    this.setData({ "settings.favScope": Number(e.detail.value) });
    this._save();
    this._toast("收藏可见范围已更新");
  },

  clearCache() {
    wx.showModal({
      title: "清理缓存",
      content: "将清除搜索历史与临时数据，草稿、设置与登录状态会保留。",
      success: (r) => {
        if (!r.confirm) return;
        wx.removeStorageSync("qd_search_history");
        this._calcCache();
        this._toast("缓存已清理");
      }
    });
  },
  checkUpdate() { this._toast("已是最新版本 " + this.data.version); },
  openTerms() { this._openDoc(ABOUT.terms); },
  openPrivacy() { this._openDoc(ABOUT.privacy); },
  _openDoc(doc) { this.setData({ docOpen: true, docTitle: doc.title, docBody: doc.body }); },
  onDocClose() { this.setData({ docOpen: false }); },
  about() {
    wx.showModal({
      title: "关于青云",
      content: "青云 · 校园学习社区\n让每一次坚持都被看见\n\n版本 " + this.data.version,
      showCancel: false,
      confirmText: "知道了"
    });
  },
  feedback() {
    wx.showModal({
      title: "意见反馈",
      editable: true,
      placeholderText: "说说你遇到的问题或建议…",
      success: (r) => {
        if (!r.confirm) return;
        const text = (r.content || "").trim();
        if (!text) { this._toast("还没有填写内容"); return; }
        const list = wx.getStorageSync("qd_feedback") || [];
        list.unshift({ text, at: Date.now() });
        wx.setStorageSync("qd_feedback", list.slice(0, 50));
        this._toast("反馈已收到，谢谢");
      }
    });
  },
  changePassword() { wx.navigateTo({ url: "/pages/login/login?mode=forgot" }); },
  logout() {
    wx.showModal({
      title: "退出登录",
      content: "退出后需要重新登录才能继续使用，草稿会保留在本机。",
      confirmColor: "#FF5A5A",
      success: (r) => {
        if (!r.confirm) return;
        ["token", "role", "user", "tenantId", "tenantCode", "qd_wx_code"].forEach(k => wx.removeStorageSync(k));
        wx.reLaunch({ url: "/pages/login/login" });
      }
    });
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
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/mine/mine" }) }); },
  noop() {},
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
