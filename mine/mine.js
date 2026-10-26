const { ME } = require("../../data/me.js");

Page({
  data: {
    sb: 52,
    navHide: false,
    draftCount: 0,
    meName: ME.name,
    meCh: ME.ch,
    avatarUrl: ME.avatarUrl,
    meBg: ME.bg,
    meBgUrl: ME.bgUrl,
    rows: [],
    rowLabels: ["一", "", "三", "", "五", "", "日"],
    colLabels: ["去年 10 月", "1 月", "4 月", "7 月", "本周"],
    toastShow: false,
    toastMsg: ""
  },
  onLoad() {
    const sb = getApp().globalData.sbTop;
    // 打卡热力图（列 = 一年中的第几周 53 列，行 = 周一~周日；真实日期定位，今天闪烁）
    const lv = [0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 4];
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const grid = Array.from({ length: 7 }, () => Array(53).fill("off"));
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const col = 52 - Math.floor(i / 7);
      const row = (d.getDay() + 6) % 7;
      let cls = "off";
      if (i === 0) cls = "today";
      else {
        const l = lv[Math.floor(rnd() * lv.length)];
        cls = l ? "l" + l : "";
      }
      grid[row][col] = cls;
    }
    // 转置为“53 列 × 每列 7 格”供渲染（.ht-col 纵向堆一周的 7 天）
    const cols = Array.from({ length: 53 }, (_, c) => Array.from({ length: 7 }, (_, r) => grid[r][c]));
    // 与 sb 合并成一次下发：热力图 371 格，少一轮整表渲染
    this.setData({ sb, rows: cols });
  },
  onShow() {
    // 从编辑资料页返回时同步最新资料 + 草稿数；值没变就不下发，避免每次返回都重渲染头部
    const next = {
      draftCount: (wx.getStorageSync("qd_drafts") || []).length,
      meName: ME.name, meCh: ME.ch, avatarUrl: ME.avatarUrl, meBg: ME.bg, meBgUrl: ME.bgUrl
    };
    const d = this.data;
    if (Object.keys(next).some(k => next[k] !== d[k])) this.setData(next);
  },
  goEdit() { wx.navigateTo({ url: "/pages/profile-edit/profile-edit" }); },
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
  goPage(e) { wx.navigateTo({ url: e.currentTarget.dataset.u }); },
  tip(e) { this._toast(e.currentTarget.dataset.t); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
