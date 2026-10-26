// 资料数据（ResourceVO 摘要）
const RESOURCES = [
  { id: 1, ext: "PDF", amber: false, name: "数据结构期末复习思维导图（含近三年真题标注）", meta: "328 次下载 · v2 · 林青云", cat: "讲义", course: "数据结构", hot: 328 },
  { id: 2, ext: "XLS", amber: true, name: "考研数学一近十年真题按知识点分类（含错题统计列）", meta: "512 次下载 · v3 · 郑雨桐", cat: "真题", course: "考研数学", hot: 512 },
  { id: 3, ext: "DOC", amber: true, name: "文献综述模板（学长共享）", meta: "154 次下载 · v1 · 苏墨", cat: "模板", course: "毕业论文", hot: 154 },
  { id: 4, ext: "PDF", amber: false, name: "四六级高频词组手册", meta: "121 次下载 · v2 · 李想", cat: "讲义", course: "英语", hot: 121 },
  { id: 5, ext: "PPT", amber: false, name: "操作系统期末复习课件（老师划重点版）", meta: "98 次下载 · v1 · 王立", cat: "讲义", course: "操作系统", hot: 98 },
  { id: 6, ext: "PDF", amber: false, name: "微观经济学名词解释全集", meta: "77 次下载 · v1 · 周晓", cat: "笔记", course: "微观经济学", hot: 77 }
];
const CATS = ["全部", "讲义", "真题", "笔记", "模板"];

const PREVIEW_TEXT = [
  "第 1 章 绪论：数据结构的三要素——逻辑结构、存储结构、运算。",
  "第 2 章 线性表：顺序表随机存取 O(1)；单链表插入删除 O(1)（定位后）。真题标注：2023 选择第 3 题、2024 大题第 1 题。",
  "第 3 章 栈与队列：中缀转后缀的手推步骤（真题高频）；循环队列判满的两种写法。",
  "第 5 章 树：二叉树遍历的递归/非递归实现；哈夫曼树的 WHT 计算（2024 大题）。",
  "……（共 8 章，下载查看完整版 12 页）"
];
const RELATED = [RESOURCES[1], RESOURCES[4]];
module.exports = { RESOURCES, CATS, PREVIEW_TEXT, RELATED };
