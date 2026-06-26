export type RiskLevel = "安全" | "关注" | "积水" | "高危";
export type AreaId = "riverbank" | "lowland" | "garage" | "underpass" | "residential" | "shelter";
export type ActionId = "observe" | "warn" | "evacuate" | "lock" | "drain" | "support";

export const floodGameText = {
  pageTitle: "风险推演",
  title: "洪涛倒城：三回合避险",
  testEntryTitle: "测试：洪涛倒城三回合避险",
  testEntryDesc: "用三回合时间判断水势、组织转移、封锁险区。",
  testEntryButton: "开始推演",
  background:
    "不周山崩后，洪水逼近城中。你是城中应急指挥者，只有三回合时间。请在有限行动点内，看清水势、发布预警、疏散居民、封锁险区，尽量减少被困人数。",
  targetHint: "请选择一个区域作为行动目标。",
  endRound: "结束本回合",
  continue: "继续推演",
  showResult: "查看推演结果",
  viewDecode: "查看风险解码",
  restart: "重新推演",
  backVolume: "返回共工卷",
  noActionPoints: "本回合行动点已用完，请进入回合结算。",
  roundLabel: "当前回合",
  apLabel: "剩余行动点",
  evacuatedLabel: "疏散人数",
  trappedLabel: "被困人数",
  focusLabel: "重点风险",
  lockedLabel: "已封锁",
  unlockedLabel: "未封锁",
  resultTitle: "推演结果"
};

export const riskLevels: RiskLevel[] = ["安全", "关注", "积水", "高危"];

export const initialAreas = [
  { id: "riverbank", name: "河岸堤口", risk: "关注" as RiskLevel, residents: 8, focus: true },
  { id: "lowland", name: "低洼街区", risk: "关注" as RiskLevel, residents: 18, focus: true },
  { id: "garage", name: "地下车库", risk: "安全" as RiskLevel, residents: 10, focus: true },
  { id: "underpass", name: "下穿桥洞", risk: "安全" as RiskLevel, residents: 6, focus: true },
  { id: "residential", name: "居民区", risk: "安全" as RiskLevel, residents: 24, focus: false },
  { id: "shelter", name: "高地避难点", risk: "安全" as RiskLevel, residents: 0, focus: false }
];

export const actionCards = [
  {
    id: "observe" as ActionId,
    title: "观察水势",
    desc: "提前显示下一回合洪水会影响的区域，提升识险能力。",
    feedback: "你观察到水流正在向低洼街区和地下空间聚集。下一回合这些区域风险会上升。"
  },
  {
    id: "warn" as ActionId,
    title: "发布预警",
    desc: "提高居民配合度，使后续疏散效率提升。",
    feedback: "预警已发布，居民开始准备转移。之后疏散效率提升。",
    repeated: "预警已经发布，无需重复发布。"
  },
  {
    id: "evacuate" as ActionId,
    title: "疏散居民",
    desc: "选择一个区域，将居民转移到高地避难点。",
    targetHint: "选择需要疏散的区域。"
  },
  {
    id: "lock" as ActionId,
    title: "封锁危险区",
    desc: "选择一个区域封锁，防止人员误入，降低后续被困风险。",
    targetHint: "选择需要封锁的风险区域。"
  },
  {
    id: "drain" as ActionId,
    title: "开启排水",
    desc: "选择低洼街区或地下车库，尝试降低一个风险等级。",
    targetHint: "选择低洼街区或地下车库。"
  },
  {
    id: "support" as ActionId,
    title: "请求支援",
    desc: "本回合没有直接救援效果，下一回合行动点 +1。",
    feedback: "支援请求已发出。下一回合可用行动点增加。",
    repeated: "本局已经请求过支援，无法重复使用。",
    finalRound: "当前已是最后一回合，请求支援无法增加下一回合行动点。"
  }
];

export const floodEvents = [
  {
    round: 1,
    title: "河水上涨",
    affectedAreaIds: ["riverbank", "lowland"] as AreaId[],
    text: "洪水开始越过河岸，低洼街区首先受到影响。"
  },
  {
    round: 2,
    title: "地下倒灌",
    affectedAreaIds: ["garage", "underpass", "lowland"] as AreaId[],
    text: "地下空间风险迅速上升，车库和桥洞成为危险区域。"
  },
  {
    round: 3,
    title: "洪涛入城",
    affectedAreaIds: ["riverbank", "lowland", "garage", "underpass", "residential"] as AreaId[],
    text: "洪涛入城，低洼、地下、临水区域全面进入高危状态。"
  }
];

export const scoringRules = {
  baseActionPoints: 2,
  supportActionPoints: 3,
  warningEvacuateCount: 12,
  normalEvacuateCount: 8,
  highRiskEvacuateMultiplier: 0.5,
  trappedRateUnlocked: 0.3,
  trappedRateLocked: 0.15,
  keyLockAreaIds: ["garage", "underpass", "riverbank"] as AreaId[]
};

export const resultTypes = [
  {
    id: "steady",
    title: "稳健指挥者",
    text: "你能先识别风险，再组织行动。面对洪水逼近，你没有盲目冲入险区，而是抓住了关键节点和安全边界。"
  },
  {
    id: "fast",
    title: "快速行动者",
    text: "你行动很快，能及时转移一部分居民。但在信息不足时直接行动，容易漏掉地下空间、桥洞等隐蔽风险。"
  },
  {
    id: "careful",
    title: "谨慎观察者",
    text: "你能看见风险，但行动稍慢。灾变中，判断之后必须尽快采取行动，否则会错过最佳避险窗口。"
  },
  {
    id: "trapped",
    title: "被洪涛困住",
    text: "你错过了关键避险窗口。面对洪水风险，不能只等待，也不能盲目靠近，必须尽快识别危险边界并组织转移。"
  }
];
