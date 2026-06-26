export type RiskLevel = "安全" | "关注" | "积水" | "高危";
export type AreaId = "riverbank" | "lowland" | "garage" | "underpass" | "residential" | "shelter";
export type ActionId = "observe" | "warn" | "evacuate" | "lock" | "drain" | "support";

export const floodGameText = {
  pageTitle: "风险推演",
  title: "洪涛倒城：三回合避险",
  subtitle: "风险推演｜现代城市内涝",
  testEntryTitle: "测试：洪涛倒城三回合避险",
  testEntryDesc: "把神话中的系统失衡，转译为现代城市暴雨内涝推演。",
  testEntryButton: "开始推演",
  transferTip:
    "神话里的“洪涛倒城”，在现代城市中可能表现为暴雨内涝、地下空间倒灌、低洼街区积水和交通通道失守。",
  background:
    "神话中的不周山崩，象征关键支撑点被破坏后引发系统失衡。现在，请进入一场现代城市暴雨内涝推演：强降雨正在逼近城区，你需要在三回合内识别风险、封锁危险区域、组织转移，尽量减少被困人数。",
  guide:
    "你每回合只有 2 个行动点。系统不会直接告诉你答案，请根据风险线索判断下一步行动。不同选择会影响三回合后的结果。",
  guideButton: "开始推演",
  clueLabel: "风险线索",
  goalLabel: "本回合目标",
  selectingPrefix: "正在执行",
  cancelAction: "取消操作",
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
  judgementLabel: "关键判断",
  focusLabel: "重点风险",
  lockedLabel: "已封锁",
  unlockedLabel: "未封锁",
  resultTitle: "推演结果",
  judgementReviewTitle: "关键判断回顾"
};

export const riskLevels: RiskLevel[] = ["安全", "关注", "积水", "高危"];

export const initialAreas = [
  { id: "riverbank", name: "河岸堤口", risk: "关注" as RiskLevel, residents: 8, focus: true },
  { id: "lowland", name: "低洼街区", risk: "关注" as RiskLevel, residents: 18, focus: true },
  { id: "garage", name: "地下车库", risk: "安全" as RiskLevel, residents: 10, focus: true },
  { id: "underpass", name: "下穿通道", risk: "安全" as RiskLevel, residents: 6, focus: true },
  { id: "residential", name: "居民小区", risk: "安全" as RiskLevel, residents: 24, focus: false },
  { id: "shelter", name: "高地避险点", risk: "安全" as RiskLevel, residents: 0, focus: false }
];

export const roundBriefs = [
  {
    round: 1,
    title: "第1回合：水势初涨",
    situation: "强降雨持续，城区河道水位快速上涨。低洼路段已经出现积水，但多数居民还没有意识到风险正在扩大。",
    clue: "河水变浑，水位上涨，低洼街区排水变慢，部分地下空间入口已有积水迹象。",
    goal: "判断风险正在往哪里发展。",
    next: "下一回合，水流将继续向低处聚集。"
  },
  {
    round: 2,
    title: "第2回合：地下倒灌",
    situation: "雨势没有减弱，水流开始向低处聚集。地下空间、下穿通道和临水区域风险快速升高。",
    clue: "地下车库入口出现倒灌，下穿通道水位上升，河岸堤口附近仍有人停留。",
    goal: "确认哪些地方已经不能靠近。",
    next: "最后一回合，安全转移窗口会明显缩短。"
  },
  {
    round: 3,
    title: "第3回合：洪涛入城",
    situation: "城市内涝加剧，低洼、地下、临水区域全面进入高危状态。",
    clue: "部分居民仍滞留在低洼街区和地下空间附近，安全转移窗口正在快速关闭。",
    goal: "在窗口关闭前减少滞留风险。",
    next: "推演结束后，将根据滞留与被困情况生成复盘。"
  }
];

export const actionCards = [
  {
    id: "observe" as ActionId,
    title: "观察水势",
    shortTitle: "观察",
    desc: "提前显示下一回合洪水会影响的区域，提升识险能力。",
    shortDesc: "预判水势",
    feedback: "你观察到水流正在向低洼街区和地下空间聚集。下一回合这些区域风险会上升。"
  },
  {
    id: "warn" as ActionId,
    title: "发布预警",
    shortTitle: "预警",
    desc: "提高居民配合度，使后续疏散效率提升。",
    shortDesc: "提醒居民",
    feedback: "预警已发布，居民开始准备转移。之后疏散效率提升。",
    repeated: "预警已经发布，无需重复发布。"
  },
  {
    id: "evacuate" as ActionId,
    title: "疏散居民",
    shortTitle: "疏散",
    desc: "选择一个区域，将居民转移到高地避险点。",
    shortDesc: "转移居民",
    targetHint: "请选择要疏散的区域。"
  },
  {
    id: "lock" as ActionId,
    title: "封锁危险区",
    shortTitle: "封锁",
    desc: "选择一个区域封锁，防止人员误入，降低后续被困风险。",
    shortDesc: "阻止误入",
    targetHint: "请选择要封锁的区域。"
  },
  {
    id: "drain" as ActionId,
    title: "开启排水",
    shortTitle: "排水",
    desc: "选择低洼街区或地下车库，尝试降低一个风险等级。",
    shortDesc: "降低积水",
    targetHint: "请选择要排水的区域。"
  },
  {
    id: "support" as ActionId,
    title: "请求支援",
    shortTitle: "支援",
    desc: "本回合没有直接救援效果，下一回合行动点 +1。",
    shortDesc: "下回合+1",
    feedback: "支援请求已发出。下一回合可用行动点增加。",
    repeated: "本局已经请求过支援，无法重复使用。",
    finalRound: "当前已是最后一回合，请求支援无法增加下一回合行动点。"
  }
];

export const floodEvents = [
  {
    round: 1,
    title: "强降雨持续",
    affectedAreaIds: ["riverbank", "lowland"] as AreaId[],
    text: "强降雨持续，河岸堤口与低洼街区风险上升。"
  },
  {
    round: 2,
    title: "地下倒灌",
    affectedAreaIds: ["garage", "underpass", "lowland"] as AreaId[],
    text: "地下空间开始倒灌，地下车库升至高危，下穿通道开始积水。"
  },
  {
    round: 3,
    title: "洪涛入城",
    affectedAreaIds: ["riverbank", "lowland", "garage", "underpass", "residential"] as AreaId[],
    text: "城市内涝加剧，低洼、地下、临水区域全面高危。"
  }
];

export const scoringRules = {
  baseActionPoints: 2,
  supportActionPoints: 3,
  warningEvacuateCount: 12,
  normalEvacuateCount: 8,
  highRiskEvacuateMultiplier: 0.5,
  trappedRateUnlocked: 0.3,
  trappedRateUncontrolledUnderground: 0.45,
  trappedRateLocked: 0.15,
  keyLockAreaIds: ["garage", "underpass", "riverbank"] as AreaId[]
};

export const judgementReviews = {
  earlyRisk: {
    title: "初期识险",
    done: "你及时注意到水位上涨和低洼积水，为后续判断争取了时间。",
    missed: "你没有及时识别早期内涝信号，后续判断窗口被压缩。"
  },
  boundaryControl: {
    title: "边界管控",
    done: "你及时管控了地下空间和下穿通道，减少了误入风险。",
    missed: "地下空间和下穿通道未及时封锁，倒灌后风险扩大。"
  },
  finalTransfer: {
    title: "最后转移",
    done: "你在窗口期内组织了转移，减少了高危区滞留。",
    missed: "你错过了最后转移窗口，高危区滞留风险上升。"
  }
};

export const resultTypes = [
  {
    id: "steady",
    title: "稳健指挥者",
    text: "你能根据线索判断风险，并在关键窗口组织行动。面对内涝逼近，你没有盲目进入险区，而是抓住了边界与转移时机。"
  },
  {
    id: "fast",
    title: "快速行动者",
    text: "你行动很快，能及时转移一部分居民。但在信息不足时直接行动，容易漏掉地下空间、下穿通道等隐蔽风险。"
  },
  {
    id: "careful",
    title: "谨慎观察者",
    text: "你能看见风险，但行动稍慢。灾变中，判断之后必须尽快采取行动，否则会错过最佳避险窗口。"
  },
  {
    id: "trapped",
    title: "被洪涛困住",
    text: "你错过了关键避险窗口。面对城市内涝风险，不能只等待，也不能盲目靠近，必须尽快识别危险边界并组织转移。"
  }
];
