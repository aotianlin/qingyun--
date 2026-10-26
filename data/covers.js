// 话题 → 渐变封面映射表（动作 1：分类渐变封面系统）
// 全站集中管理，禁止散在各页面；样式类定义在 app.wxss（.gcover + .cv-*）
const TOPIC_COVERS = {
  sunset:  { cls: "cv-sunset",  name: "晚霞 / 摄影" },
  library: { cls: "cv-library", name: "图书馆 / 自习" },
  ginkgo:  { cls: "cv-ginkgo",  name: "秋日 / 校园风物" },
  algo:    { cls: "cv-algo",    name: "算法 / 学习" },
  default: { cls: "cv-algo" }
};
module.exports = { TOPIC_COVERS };
