App({
  onLaunch() {
    // getWindowInfo 只查窗口信息，比已废弃的 getSystemInfoSync 轻（后者会连设备/电池一起取）
    const sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const statusBarHeight = sys.statusBarHeight || 44;
    let navTop = statusBarHeight + 44;      // 兜底：约等于胶囊下沿 + 8px
    try {
      const r = wx.getMenuButtonBoundingClientRect && wx.getMenuButtonBoundingClientRect();
      if (r && r.height) navTop = r.bottom + 8;   // 微信胶囊下沿 + 8px，首行内容不再被遮挡
    } catch (e) {}
    this.globalData.statusBarHeight = statusBarHeight;
    this.globalData.sbTop = statusBarHeight + 8;
    this.globalData.navTop = navTop;
  },
  globalData: {
    statusBarHeight: 44,
    sbTop: 52,
    navTop: 88
  }
});
