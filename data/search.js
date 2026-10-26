// ===== 全站原地搜索的结果库（原型 mock；后端接入：GET /search?q=&cats=）=====
const DB = {
  posts: [
    { title: "周五晚霞收容所｜宿舍楼天台实拍", meta: "286 赞 · 摄影" },
    { title: "大一转专业到会计，现在准备来得及吗？", meta: "12 人已答 · 问答" },
    { title: "单调栈三连的通用套路：哨兵与边界一次讲透", meta: "61 赞 · 题解" },
    { title: "图书馆四楼靠窗座位避雷指南", meta: "34 赞 · 生活" }
  ],
  resources: [
    { id: 1, ext: "PDF", amber: false, name: "数据结构期末复习思维导图", meta: "328 次下载" },
    { id: 2, ext: "DOC", amber: true, name: "文献综述模板（学长共享）", meta: "154 次下载" },
    { id: 3, ext: "XLS", amber: false, name: "近十年真题按知识点分类", meta: "96 次下载" },
    { id: 4, ext: "PDF", amber: true, name: "考研政治冲刺背诵手册", meta: "212 次下载" }
  ],
  circles: [
    { k: "algo", ch: "算", bg: "#175A67", name: "算法与数据结构自习室", meta: "186 人 · 142 帖" },
    { k: "kaoyan", ch: "考", bg: "#0F454F", name: "考研自习联盟", meta: "203 人 · 96 帖" },
    { k: "photo", ch: "摄", bg: "#B26A00", name: "天台摄影社", meta: "88 人 · 64 帖" },
    { k: "lunwen", ch: "论", bg: "#3641C4", name: "论文互助圈", meta: "121 人 · 87 帖" }
  ],
  users: [
    { name: "林青云", ch: "林", bg: "#175A67", fg: "#fff", meta: "计算机学院 · 软件工程" },
    { name: "王立", ch: "王", bg: "#3641C4", fg: "#fff", meta: "电气学院 · 研二" },
    { name: "周晓", ch: "周", bg: "#B26A00", fg: "#fff", meta: "艺术学院 · 视觉传达" }
  ]
};

function filterSearch(q, cats) {
  q = (q || "").trim();
  const out = { rPosts: [], rRes: [], rCircles: [], rUsers: [], count: 0 };
  if (!q) return out;
  const has = c => cats.indexOf(c) >= 0;
  if (has("post")) out.rPosts = DB.posts.filter(x => x.title.indexOf(q) >= 0);
  if (has("res")) out.rRes = DB.resources.filter(x => x.name.indexOf(q) >= 0);
  if (has("circle")) out.rCircles = DB.circles.filter(x => x.name.indexOf(q) >= 0);
  if (has("user")) out.rUsers = DB.users.filter(x => x.name.indexOf(q) >= 0);
  out.count = out.rPosts.length + out.rRes.length + out.rCircles.length + out.rUsers.length;
  return out;
}

module.exports = { DB, filterSearch };
