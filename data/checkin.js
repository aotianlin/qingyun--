// 打卡挑战数据（结构对齐 CheckinChallengeVO + 我的进度聚合）
const CHALLENGES = [
  { id: 1, name: "每日算法打卡", cat: "学习", ring: "ring-r9-30-g", cur: 9, total: 30, meta: "128 人 · 已坚持 9 天", today: "done",  note: "第 9 天：并查集路径压缩终于理顺了…" },
  { id: 2, name: "考研词汇 50 / 天", cat: "学习", ring: "ring-r12-21-g", cur: 12, total: 21, meta: "88 人 · 已坚持 12 天", today: "todo", note: "早 20 复习 + 晚 30 新词" },
  { id: 3, name: "晚跑 5 公里 · 第 4 期", cat: "运动", ring: "ring-r21-30-a", cur: 21, total: 30, meta: "64 人 · 已坚持 21 天", today: "todo", note: "5.2 公里，配速 5'48''" },
  { id: 4, name: "文献阅读 7 天", cat: "学习", ring: "ring-r2-7-g", cur: 2, total: 7, meta: "19 人 · 已坚持 2 天", today: "todo", note: "每天精读 1 篇 + 摘要" },
  { id: 5, name: "每日一句英语", cat: "学习", ring: "ring-r15-30-g", cur: 15, total: 30, meta: "64 人 · 已坚持 15 天", today: "done", note: "Day 15: The best way out is always through." },
  { id: 6, name: "早起 7 点打卡", cat: "习惯", ring: "ring-r6-30-g", cur: 6, total: 30, meta: "35 人 · 已坚持 6 天", today: "broke", note: "昨天睡过头了，今天补回来" }
];
const CATS = ["全部", "学习", "运动", "习惯"];

// 挑战详情时间线（CheckinRecordVO 摘要）
const TIMELINE = [
  { ch: "陈", bg: "#DCE9E9", fg: "#0F454F", who: "陈思远", tm: "18 分钟前", text: "LeetCode 239 滑动窗口最大值，单调队列一遍过" },
  { ch: "林", bg: "#175A67", fg: "#FFFFFF", who: "林青云", tm: "2 小时前", text: "第 9 天：并查集路径压缩终于理顺了" },
  { ch: "苏", bg: "#FFFFFF", fg: "#5C6B64", who: "苏墨", tm: "昨天 22:10", text: "KMP 失配函数手推了一遍，明天刷题验证" }
];
module.exports = { CHALLENGES, CATS, TIMELINE };
