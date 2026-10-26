Component({
  options: { styleIsolation: "apply-shared" },
  properties: {
    current: { type: String, value: "discover" }
  },
  data: {
    sheetOpen: false,
    toastShow: false,
    toastMsg: ""
  },
  methods: {
    goTab(e) {
      const p = e.currentTarget.dataset.p;
      if (p === this.data.current) return;
      const target = "/pages/" + p + "/" + p;
      const route = "pages/" + p + "/" + p;
      // 返回栈里已有目标页 → 回退到它（手机返回键 = 回到上一个 tab）
      const stack = getCurrentPages();
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].route === route) {
          const delta = stack.length - 1 - i;
          if (delta > 0) wx.navigateBack({ delta });
          return;
        }
      }
      // 栈未满 → 压栈（返回键可回）；已满 10 层 → 替换
      if (stack.length >= 10) wx.redirectTo({ url: target });
      else wx.navigateTo({ url: target });
    },
    openSheet() { this.setData({ sheetOpen: true }); },
    closeSheet() { this.setData({ sheetOpen: false }); },
    pub(e) {
      const t = e.currentTarget.dataset.t;
      const urls = {
        post: "/pages/post-create/post-create?mode=post",
        qa: "/pages/post-create/post-create?mode=qa",
        res: "/pages/resource-upload/resource-upload",
        chk: "/pages/checkin/checkin"
      };
      this.closeSheet();
      if (urls[t]) wx.navigateTo({ url: urls[t] });
      else this._toast(t);
    },
    _toast(msg) {
      this.setData({ toastShow: true, toastMsg: msg });
      clearTimeout(this._tt);
      this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
    },
    noop() {}
  }
});
