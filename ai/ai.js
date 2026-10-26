// 学伴统一问答页（原型 TOPICS/CONVOS/AI_CHIPS 逐字迁移，HTML 串改结构化）
const { ME } = require("../../data/me.js");
const CONVOS = {
  plan: { sub: "期末复习计划", ph: "例如：高数下周五考，帮我排 3 天计划",
    msgs: [
      { role: "ai", text: "报上课程和考试时间，我帮你排复习计划、查真题、理概念。" },
      { role: "user", text: "数据结构下周三考，帮我排一个 3 天复习计划，每天大概 2 小时" },
      { role: "ai", text: "排好了～结合你圈子里共享的资料，这样安排最稳：",
        plan: [{ b: "Day 1", s: "线性表 + 栈队列：先过一遍思维导图，再刷 10 道基础题巩固手感" }, { b: "Day 2", s: "树与图：重点二叉树遍历、图的 BFS/DFS，做完近三年对应真题" }, { b: "Day 3", s: "排序 + 查找 + 大题模板：一套真题限时模考，错题当天清零" }],
        cites: [{ fi: "PDF", label: "数据结构期末复习思维导图.pdf" }, { fi: "XLS", label: "近十年真题按知识点分类.xlsx" }] }
    ],
    sugs: ["生成 7 天打卡计划", "压缩成 1 天速成版", "只要大题套路"] },
  paper: { sub: "论文陪跑", ph: "例如：帮我润色这段摘要…",
    msgs: [
      { role: "ai", text: "把开题方向、综述题目或要润色的段落发我，我陪你一步步改到过。" },
      { role: "user", text: "文献综述查重率 28%，怎么快速降下来？" },
      { role: "ai", text: "别慌，三招最见效：",
        plan: [{ b: "改写", s: "长句拆短、主动被动互换，保持原意换句式" }, { b: "替换", s: "高频术语换同义表述，数据改成表格呈现" }, { b: "引用", s: "观点都标注来源，直接引用转间接转述" }],
        cites: [{ fi: "DOC", label: "文献综述模板（学长共享）.docx" }] }
    ],
    sugs: ["帮我改写一段", "列个开题提纲", "检查参考文献格式"] }
};

const CITES2 = [{ fi: "PDF", label: "数据结构期末复习思维导图.pdf" }, { fi: "XLS", label: "近十年真题按知识点分类.xlsx" }];
const TOPICS = [
  { k: ["复习", "考试", "冲刺", "速成", "几天", "排计划", "计划", "高数", "线代", "概率", "四六级", "期末", "划重点"], t: "复习规划",
    text: "这类复习问题我最拿手，通用骨架是：",
    plan: [{ b: "圈考点", s: "对照考纲和历年真题，先标出高频章节" }, { b: "分轮次", s: "第一轮过概念 → 第二轮刷题 → 第三轮限时模考" }, { b: "留缓冲", s: "考前一天只看错题，不碰新内容" }],
    tail: "把课程名和考试时间发我，我按这个骨架排每天的任务清单。", cites: CITES2 },
  { k: ["论文", "降重", "开题", "综述", "摘要", "润色", "查重", "参考文献"], t: "论文写作",
    text: "论文的事分三段走：",
    plan: [{ b: "搭骨架", s: "先定研究问题和提纲，我帮你逐节展开" }, { b: "填内容", s: "每写完一段发我，我帮你顺逻辑、改表达" }, { b: "过检查", s: "查重、格式、参考文献一条条过" }],
    tail: "现在到哪一步了？把开题方向或段落发我。",
    cites: [{ fi: "DOC", label: "文献综述模板（学长共享）.docx" }] },
  { k: ["真题", "考点", "考了什么", "题型", "出题", "大纲"], t: "真题题库",
    text: "真题我来捞：报上课程，我按知识点分类整理近十年题目，并标出高频考点。", plan: [], tail: "", cites: CITES2 },
  { k: ["选课", "老师", "给分", "考勤", "哪个好", "选哪个", "抢课"], t: "选课参考",
    text: "选课看三件事：给分、收获、时间成本。把备选课程发我，我综合圈内学长学姐的真实评价给你对比。", plan: [], tail: "",
    cites: [{ fi: "XLS", label: "选课评价汇总（2025 春）.xlsx" }] },
  { k: ["打卡", "坚持", "习惯", "背单词", "词汇", "早起", "跑步", "挑战"], t: "打卡挑战",
    text: "想坚持的事告诉我，我帮你定节奏：目标拆小、固定时间、漏卡兜底提醒，还能拉同学围观监督。说吧，你想坚持什么？", plan: [], tail: "", cites: [] },
  { k: ["总结", "速览", "热帖", "广场", "今天", "新鲜事"], t: "内容速览",
    text: "好，把今天广场的热帖压成三句话：① 天台晚霞图 402 赞最火；② 数据结构思维导图 v2 更新；③ 转专业提问已有 12 条高质量回答。想深入哪条说一声。", plan: [], tail: "", cites: [] },
  { k: ["焦虑", "压力", "睡不着", "失眠", "迷茫", "烦", "emo", "孤独", "累"], t: "树洞倾听",
    text: "先抱一下，期末周大家都紧，你不是一个人。要倾诉我听着；要方法我也有：睡前十分钟呼吸放松、把待办写下来清空大脑、每天留半小时纯休息。想聊聊具体是哪件事吗？", plan: [], tail: "", cites: [] },
  { k: ["食堂", "宿舍", "二手", "闲置", "外卖", "快递", "校园卡", "生活"], t: "校园生活",
    text: "生活问题也可以问我～食堂窗口、二手闲置、宿舍用电这些，我会去圈子里的真实帖子里帮你找答案，并附上原帖链接。", plan: [], tail: "", cites: [] }
];
const DEFAULT_REPLY = { text: "好问题，分两步来：① 先在站内资料库搜一圈，看同学有没有整理过相关内容；② 没有现成的，我直接给答案并标注引用来源。", plan: [], tail: "", cites: CITES2 };

const AI_CHIPS = [["排复习计划", "帮我排期末复习计划"], ["论文降重", "论文查重怎么降重"], ["查真题", "历年真题都考了什么"], ["选课参谋", "两门课选哪个好"], ["打卡计划", "生成 21 天打卡计划"], ["总结热帖", "总结今天广场的热帖"]];
const ASKS = ["数据结构下周三考试，怎么抢救？", "文献综述查重 28%，还有救吗？", "AI 导论还是编译原理，选哪个好？"];
const GREETING = "你好，我是青云学伴。复习计划、论文降重、真题速查、选课、打卡、生活琐事……什么都能问，直接打字，或从今天大家都在问的问题开始：";

function topicOf(q) {
  for (const tp of TOPICS) { if (tp.k.some(w => q.indexOf(w) >= 0)) return tp; }
  return null;
}

Page({
  data: {
    sb: 52,
    aiFace: "",
    me: { ch: ME.ch, avatarUrl: ME.avatarUrl, bg: ME.bg, fg: ME.fg },
    chips: AI_CHIPS,
    asks: ASKS,
    greetingText: GREETING,
    hints: true,
    msgs: [],
    chatOpen: false,
    hist: null,
    histMsgs: [],
    histSugs: [],
    inputFocus: false,
    kbH: 0,
    input: "",
    chatInput: "",
    scrollId: "",
    histScrollId: "",
    toastShow: false,
    toastMsg: ""
  },
  onLoad() { this.setData({ sb: getApp().globalData.statusBarHeight }); },
  onShow() { this.setData({ me: { ch: ME.ch, avatarUrl: ME.avatarUrl, bg: ME.bg, fg: ME.fg } }); },
  onInputFocus() { this.setData({ inputFocus: true }); },
  onInputBlur() { this.setData({ inputFocus: false }); },
  onKb(e) {
    const h = e.detail.height || 0;
    this.setData({ kbH: h });
    if (h > 0) {
      if (this.data.chatOpen && this.data.histMsgs.length) this.setData({ histScrollId: "h" + (this.data.histMsgs.length - 1) });
      else if (this.data.msgs.length) this.setData({ scrollId: "m" + (this.data.msgs.length - 1) });
    }
  },
  goBack() { wx.navigateBack({ fail: () => wx.redirectTo({ url: "/pages/discover/discover" }) }); },
  noop() {},
  openHist(e) {
    const c = CONVOS[e.currentTarget.dataset.k];
    this.setData({ chatOpen: true, hist: { sub: c.sub, ph: c.ph }, histMsgs: c.msgs, histSugs: c.sugs, histScrollId: "h" + (c.msgs.length - 1) });
  },
  closeHist() { this.setData({ chatOpen: false }); },
  ask(q) {
    if (this.data.hints) this.setData({ hints: false });
    const typing = { role: "ai", typing: true };
    const base = this.data.msgs.concat([{ role: "user", text: q }, typing]);
    this.setData({ msgs: base, scrollId: "m" + (base.length - 1), input: "", aiFace: "think" });
    const tp = topicOf(q) || DEFAULT_REPLY;
    setTimeout(() => {
      const msgs = this.data.msgs.slice();
      msgs.splice(msgs.length - 1, 1, { role: "ai", text: tp.text, plan: tp.plan || [], tail: tp.tail || "", cites: tp.cites || [] });
      this.setData({ msgs, scrollId: "m" + (msgs.length - 1), aiFace: "happy" });
      clearTimeout(this._faceT);
      this._faceT = setTimeout(() => this.setData({ aiFace: "" }), 1600);
    }, 1100);
  },
  onChip(e) { this.ask(e.currentTarget.dataset.q); },
  onAskItem(e) { this.ask(e.currentTarget.dataset.q); },
  onInput(e) { this.setData({ input: e.detail.value }); },
  onSend() {
    const v = (this.data.input || "").trim();
    if (!v) { this._toast("先输入你的问题吧"); return; }
    this.ask(v);
  },
  histQuick(e) { this.histAsk(e.currentTarget.dataset.q); },
  histInput(e) { this.setData({ chatInput: e.detail.value }); },
  histSend() {
    const v = (this.data.chatInput || "").trim();
    if (!v) { this._toast("先输入你的问题吧"); return; }
    this.histAsk(v);
  },
  // 历史会话内继续追问：先落用户消息 + 打字态，再按话题路由补回答
  histAsk(q) {
    const base = this.data.histMsgs.concat([{ role: "user", text: q }, { role: "ai", typing: true }]);
    this.setData({ histMsgs: base, chatInput: "", histScrollId: "h" + (base.length - 1), aiFace: "think" });
    const tp = topicOf(q) || DEFAULT_REPLY;
    setTimeout(() => {
      const msgs = this.data.histMsgs.slice();
      msgs.splice(msgs.length - 1, 1, { role: "ai", text: tp.text, plan: tp.plan || [], tail: tp.tail || "", cites: tp.cites || [] });
      this.setData({ histMsgs: msgs, histScrollId: "h" + (msgs.length - 1), aiFace: "happy" });
      clearTimeout(this._faceT);
      this._faceT = setTimeout(() => this.setData({ aiFace: "" }), 1600);
    }, 1000);
  },
  tip(e) { this._toast(e.currentTarget.dataset.t); },
  _toast(msg) {
    this.setData({ toastShow: true, toastMsg: msg });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => this.setData({ toastShow: false }), 1600);
  }
});
