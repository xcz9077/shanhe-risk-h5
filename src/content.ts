const assetBase = import.meta.env.BASE_URL;
const assetUrl = (path: string) => `${assetBase}${path}`;

export const uiText = {
  projectName: "山河有变",
  versionName: "山河有变 MVP 试用版",
  versionNumber: "v0.1",
  versionFooter: "试用版 v0.1",
  splashBackground: assetUrl("images/splash-bg.png"),
  splashSubtitle: "从中国神话读懂风险与生存智慧",
  seriesLabel: "第一辑 · 五卷",
  enterButton: "进入山河",
  overviewTitle: "五个神话，五种风险智慧",
  openVolume: "进入共工卷",
  unavailableMessage: "这一卷正在开发中，敬请期待。",
  backOverview: "返回五卷总览",
  backVolume: "返回共工卷",
  restartQuiz: "重新测试",
  nextPanel: "下一格",
  viewResult: "查看结果",
  nextQuestion: "下一题",
  correct: "正确。",
  incorrect: "错误。",
  mythLabel: "神话原型",
  keywordLabel: "关键词",
  disasterLabel: "对应灾种",
  mythMeaning: "神话含义",
  realityMapping: "现实对应",
  lockedHint: "锁",
  answerPrefix: ["A", "B", "C"],
  toastConfirm: "知道了",
  theaterLabel: "神话剧场",
  quizLabel: "生存小测",
  resultLabel: "测试结果",
  expand: "展开",
  collapse: "收起"
};

export const volumes = [
  {
    id: "gonggong",
    order: "第一卷",
    title: "共工卷",
    subtitle: "洪涛倒城",
    myth: "祝融大战共工 · 撞不周山",
    keyword: "识险",
    disaster: "洪水 · 城市内涝",
    status: "开放体验",
    isOpen: true
  },
  {
    id: "dayu",
    order: "第二卷",
    title: "大禹卷",
    subtitle: "疏川定流",
    myth: "鲧与禹 · 治水十三年",
    keyword: "疏导",
    disaster: "流域洪灾 · 水利",
    status: "即将开放",
    isOpen: false
  },
  {
    id: "houyi",
    order: "第三卷",
    title: "后羿卷",
    subtitle: "烈日焚空",
    myth: "十日并出 · 后羿射日",
    keyword: "承压",
    disaster: "高温 · 热浪",
    status: "即将开放",
    isOpen: false
  },
  {
    id: "nuwa",
    order: "第四卷",
    title: "女娲卷",
    subtitle: "裂天补天",
    myth: "女娲补天 · 断鳌立极",
    keyword: "韧性",
    disaster: "地震 · 灾后重建",
    status: "即将开放",
    isOpen: false
  },
  {
    id: "ebo",
    order: "第五卷",
    title: "阏伯卷",
    subtitle: "火归其位",
    myth: "阏伯守火种 · 建火神台",
    keyword: "守界",
    disaster: "火灾 · 城市消防",
    status: "即将开放",
    isOpen: false
  }
];

export const gonggongVolume = {
  title: "共工卷",
  subtitle: "洪涛倒城",
  myth: "祝融大战共工 · 撞不周山",
  keyword: "识险",
  disaster: "洪水 · 城市内涝",
  intro: "从水火之战到不周山崩，理解冲突升级、关键节点破坏与系统性灾变。",
  entries: [
    {
      id: "theater",
      title: "神话剧场",
      desc: "观看互动漫画，进入水火之战。",
      button: "进入剧场"
    },
    {
      id: "decode",
      title: "风险解码",
      desc: "把共工撞山转译成现实风险知识。",
      button: "开始解码"
    },
    {
      id: "quiz",
      title: "生存小测",
      desc: "测试你的灾变判断力。",
      button: "开始测试"
    }
  ]
};

export const theater = {
  title: "水火之战：共工怒触不周山",
  summary: "局部冲突如果不断升级，可能破坏关键节点，引发系统性灾变。",
  comics: [
    {
      image: assetUrl("images/comic-1.png"),
      title: "天地有柱",
      text: "很久以前，天地并不像今天这样安稳。不周山立在西北，像一根巨大的柱子，撑住天穹，也维系着山河秩序。",
      hotspot: { x: 74, y: 20, label: "不周山不是普通的山，它象征着天地系统中的关键支撑点。" }
    },
    {
      image: assetUrl("images/comic-2.png"),
      title: "水火各据一方",
      text: "祝融掌火，共工驭水。火带来光与秩序，水带来流动与力量。两种力量本可相互制衡，却也可能彼此冲撞。",
      hotspot: { x: 24, y: 21, label: "风险常常来自力量失衡，而不是某一种力量本身。" }
    },
    {
      image: assetUrl("images/comic-3.png"),
      title: "争端爆发",
      text: "当边界被打破，冲突开始出现。水不再安于河道，火也不再只是照亮黑夜。天地之间，紧张正在积累。",
      hotspot: { x: 58, y: 36, label: "很多灾变开始前，都会先出现边界被突破的信号。" }
    },
    {
      image: assetUrl("images/comic-4.png"),
      title: "祝融战共工",
      text: "祝融与共工终于开战。火焰蒸腾，洪水翻卷，山谷震动。战斗已经不只是两位神祇的胜负，而开始影响整个天地。",
      hotspot: { x: 54, y: 52, label: "局部冲突一旦扩大，就可能牵动更大的系统。" }
    },
    {
      image: assetUrl("images/comic-5.png"),
      title: "战局失控",
      text: "战斗越打越烈。火与水互相逼迫，山体开始开裂，河流开始改道。原本可控的争斗，正在变成失控的灾变。",
      hotspot: { x: 42, y: 69, label: "失控不是突然发生的，而是在一次次升级中形成的。" }
    },
    {
      image: assetUrl("images/comic-6.png"),
      title: "共工败退",
      text: "最终，共工败了。可真正危险的时刻，往往不是失败本身，而是失败之后如何反应。",
      hotspot: { x: 62, y: 54, label: "情绪失控，会让一次失败变成更大的破坏。" }
    },
    {
      image: assetUrl("images/comic-7.png"),
      title: "怒触不周山",
      text: "共工不甘失败，怒而撞向不周山。那座支撑天地的神山轰然断裂，局部的争斗，瞬间变成天地级的灾变。",
      hotspot: { x: 48, y: 42, label: "关键节点一旦被破坏，整个系统都会跟着失衡。" }
    },
    {
      image: assetUrl("images/comic-8.png"),
      title: "山河有变",
      text: "不周山断裂之后，天倾地陷，洪水横流，山河变形。人间必须重新面对一个问题：当世界改变时，怎样才能活下去？",
      hotspot: {
        x: 60,
        y: 36,
        label: "面对灾变，第一步不是逞强，也不是等待，而是先判断风险正在往哪里发展，自己在哪里才安全。"
      }
    }
  ],
  question: {
    title: "面对山河异变，你第一步应该做什么？",
    options: [
      {
        text: "立刻冲向灾变中心",
        isCorrect: false,
        feedback: "反应很快，但风险不明时贸然靠近，可能让自己进入更危险的位置。"
      },
      {
        text: "先判断变化方向和安全边界",
        isCorrect: true,
        feedback: "正确。灾变发生后，第一步是识别变化方向、判断安全边界，再决定行动。"
      },
      {
        text: "等别人告诉我怎么办",
        isCorrect: false,
        feedback: "等待可能错过最佳避险时间。风险来临时，先自保、再求助、再行动。"
      }
    ]
  }
};

export const riskDecode = {
  title: "风险解码",
  subtitle: "从共工怒触不周山，看系统性灾变如何发生。",
  cards: [
    {
      title: "关键节点",
      myth: "不周山不是普通的山，而是天地系统中的支撑点。",
      reality: "现实中的堤坝、桥梁、排水系统、交通枢纽、通信网络，也可能是城市运行中的关键节点。"
    },
    {
      title: "冲突升级",
      myth: "祝融与共工之战说明，局部冲突如果不断升级，就会突破原有边界。",
      reality: "当小问题持续扩大，它可能影响更大的系统，需要尽早识别升级信号。"
    },
    {
      title: "系统失衡",
      myth: "不周山断裂之后，天倾地陷，水流改道。",
      reality: "关键节点受损后，后果往往不是单点破坏，而是交通、通信、排水等多环节连锁失衡。"
    },
    {
      title: "生存判断",
      myth: "山河改变后，人必须重新判断自己与危险的距离。",
      reality: "面对灾变，第一步不是逞强，而是判断变化方向、确认安全边界、寻找可行路径。"
    }
  ]
};

export const quiz = {
  title: "生存小测：你会如何判断风险？",
  questions: [
    {
      title: "你发现暴雨后小区道路开始积水，水位上涨很快，第一步应该做什么？",
      options: [
        { text: "立刻下楼查看积水有多深", isCorrect: false, feedback: "靠近积水区域可能遇到井盖缺失、触电或水流冲击。" },
        { text: "远离低洼区域，观察水流方向和预警信息", isCorrect: true, feedback: "正确。先判断水流方向和安全边界，再决定是否转移。" },
        { text: "继续等待物业通知", isCorrect: false, feedback: "等待通知可能错过最佳避险时间。" }
      ]
    },
    {
      title: "如果地下车库已经开始进水，最不应该做的是？",
      options: [
        { text: "进入车库挪车", isCorrect: true, feedback: "正确识别。地下空间进水后风险上升很快，挪车不应优先于生命安全。" },
        { text: "远离地下空间", isCorrect: false, feedback: "这项行动本身是安全的，但题目问的是“最不应该做”的行为。" },
        { text: "通知家人不要下去", isCorrect: false, feedback: "提醒他人避险是必要行动，但题目问的是“最不应该做”的行为。" }
      ]
    },
    {
      title: "突发灾害中，判断“安全边界”主要是为了什么？",
      options: [
        { text: "知道哪里不能靠近", isCorrect: true, feedback: "正确。安全边界能帮助你避免进入高风险区域。" },
        { text: "找到拍照位置", isCorrect: false, feedback: "错误。灾害现场拍照可能让自己暴露在危险中。" },
        { text: "判断谁应该负责", isCorrect: false, feedback: "责任判断重要，但不是现场避险的第一步。" }
      ]
    },
    {
      title: "当你发现一个小问题正在不断扩大，说明什么？",
      options: [
        { text: "可以继续观察，不用处理", isCorrect: false, feedback: "错误。持续扩大说明风险正在升级。" },
        { text: "它可能正在从局部问题变成系统性风险", isCorrect: true, feedback: "正确。风险扩大时，要及时判断是否会引发连锁影响。" },
        { text: "只要自己不受影响就不用管", isCorrect: false, feedback: "错误。系统性风险可能很快影响更多人。" }
      ]
    },
    {
      title: "面对复杂风险，最稳妥的行动顺序是？",
      options: [
        { text: "先行动，再判断", isCorrect: false, feedback: "错误。盲目行动可能扩大危险。" },
        { text: "先判断风险，再选择行动", isCorrect: true, feedback: "正确。识别风险、判断边界、选择行动，是更稳妥的顺序。" },
        { text: "先等待，再求助", isCorrect: false, feedback: "错误。等待可能导致错过关键时间。" }
      ]
    }
  ],
  results: [
    {
      min: 4,
      max: 5,
      title: "观察型生存者",
      text: "你善于先识别环境变化，再决定行动。面对复杂风险时，你更容易看清危险正在从哪里来。"
    },
    {
      min: 2,
      max: 3,
      title: "行动型生存者",
      text: "你反应较快，但需要避免在情况不明时贸然行动。真正有效的行动，应建立在判断之后。"
    },
    {
      min: 0,
      max: 1,
      title: "迟疑型生存者",
      text: "你比较谨慎，但风险来临时不能只等待别人提醒。先确认自身安全，再尽快采取行动。"
    }
  ]
};
