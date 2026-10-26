// ===== 发布相关数据（结构对齐接口文档 §P2/#9） =====
// recentSpaces → GET /publish/recent-context
const PUBLISH_CTX = {
  recentSpaces: [
    { k: "algo", name: "算法自习室", ch: "算", bg: "#175A67" },
    { k: "kaoyan", name: "考研自习联盟", ch: "考", bg: "#0F454F" },
    { k: "lunwen", name: "论文互助圈", ch: "论", bg: "#B26A00" },
    { k: "photo", name: "摄影小组", ch: "摄", bg: "#B26A00" }
  ],
  hotTopics: ["期末冲刺", "晚霞收容所", "转专业", "四六级", "考研政治", "机位地图", "图书馆占座", "秋招"]
};

// 悬赏档位（qa 模式）
const BOUNTY_STEPS = [0, 5, 10, 20];

module.exports = { PUBLISH_CTX, BOUNTY_STEPS };
