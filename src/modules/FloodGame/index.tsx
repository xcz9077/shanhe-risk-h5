import { useReducer, useState } from "react";
import {
  actionCards,
  floodEvents,
  floodGameText,
  initialAreas,
  judgementReviews,
  resultTypes,
  riskLevels,
  roundBriefs,
  scoringRules,
  type ActionId,
  type AreaId,
  type RiskLevel
} from "../../content/floodGame";
import "./styles.css";

type GameArea = (typeof initialAreas)[number] & { locked: boolean };
type GameStatus = "playing" | "selecting" | "event" | "finished";

type GameState = {
  round: number;
  actionPoints: number;
  maxActionPoints: number;
  supportBonusNext: boolean;
  supportUsed: boolean;
  warningIssued: boolean;
  earlyRiskDone: boolean;
  boundaryControlDone: boolean;
  finalTransferDone: boolean;
  observeCount: number;
  lockCount: number;
  keyLockCount: number;
  trapped: number;
  supportEffective: boolean;
  areas: GameArea[];
  selectedAction: ActionId | null;
  message: string;
  forecast: string;
  eventReport: {
    title: string;
    text: string;
    trappedThisRound: number;
    settlement: string;
    warning: string;
    next: string;
    affectedAreaIds: AreaId[];
  } | null;
  status: GameStatus;
};

type GameAction =
  | { type: "RESET" }
  | { type: "PICK_ACTION"; actionId: ActionId }
  | { type: "PICK_AREA"; areaId: AreaId }
  | { type: "END_ROUND" }
  | { type: "CONTINUE_AFTER_EVENT" }
  | { type: "CLEAR_SELECTION" };

const initialState = (): GameState => ({
  round: 1,
  actionPoints: scoringRules.baseActionPoints,
  maxActionPoints: scoringRules.baseActionPoints,
  supportBonusNext: false,
  supportUsed: false,
  warningIssued: false,
  earlyRiskDone: false,
  boundaryControlDone: false,
  finalTransferDone: false,
  observeCount: 0,
  lockCount: 0,
  keyLockCount: 0,
  trapped: 0,
  supportEffective: false,
  areas: initialAreas.map((area) => ({ ...area, locked: false })),
  selectedAction: null,
  message: "请根据风险线索选择行动。",
  forecast: "",
  eventReport: null,
  status: "playing"
});

const areaPositions: Record<AreaId, { left: string; top: string }> = {
  riverbank: { left: "25%", top: "14%" },
  lowland: { left: "49%", top: "35%" },
  garage: { left: "23%", top: "54%" },
  underpass: { left: "76%", top: "54%" },
  residential: { left: "49%", top: "78%" },
  shelter: { left: "78%", top: "20%" }
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "RESET":
      return initialState();
    case "CLEAR_SELECTION":
      return { ...state, selectedAction: null, status: "playing", message: "已取消操作。" };
    case "PICK_ACTION":
      return pickAction(state, action.actionId);
    case "PICK_AREA":
      return pickArea(state, action.areaId);
    case "END_ROUND":
      return resolveRound(state);
    case "CONTINUE_AFTER_EVENT":
      if (state.round >= 3) {
        return { ...state, status: "finished", selectedAction: null };
      }

      {
        const hasSupport = state.supportBonusNext;
        const nextMax = hasSupport ? scoringRules.supportActionPoints : scoringRules.baseActionPoints;
        return {
          ...state,
          round: state.round + 1,
          actionPoints: nextMax,
          maxActionPoints: nextMax,
          supportBonusNext: false,
          selectedAction: null,
          eventReport: null,
          status: "playing",
          message: hasSupport ? "有效行动：支援力量到达，本回合行动点增加。" : "请根据风险线索选择行动。"
        };
      }
    default:
      return state;
  }
}

function pickAction(state: GameState, actionId: ActionId): GameState {
  if (state.status !== "playing" || state.actionPoints <= 0) {
    return { ...state, message: floodGameText.noActionPoints };
  }

  const action = actionCards.find((item) => item.id === actionId);
  if (!action) return state;

  if (actionId === "evacuate" || actionId === "lock" || actionId === "drain") {
    return {
      ...state,
      selectedAction: actionId,
      status: "selecting",
      message: action.targetHint || floodGameText.targetHint
    };
  }

  if (actionId === "observe") {
    return spendPoint({
      ...state,
      observeCount: state.observeCount + 1,
      earlyRiskDone: state.earlyRiskDone || state.round === 1,
      forecast: getObservationNote(state),
      message: getActionFeedback(state, "observe")
    });
  }

  if (actionId === "warn") {
    if (state.warningIssued) {
      return { ...state, message: action.repeated || "" };
    }

    return spendPoint({
      ...state,
      warningIssued: true,
      earlyRiskDone: state.earlyRiskDone || state.round === 1,
      message: getActionFeedback(state, "warn")
    });
  }

  if (actionId === "support") {
    if (state.supportUsed) {
      return { ...state, message: action.repeated || "" };
    }

    if (state.round >= 3) {
      return { ...state, message: action.finalRound || "" };
    }

    return spendPoint({
      ...state,
      supportUsed: true,
      supportBonusNext: true,
      supportEffective: true,
      message: getActionFeedback(state, "support")
    });
  }

  return state;
}

function pickArea(state: GameState, areaId: AreaId): GameState {
  if (!state.selectedAction || state.status !== "selecting") return state;
  const area = state.areas.find((item) => item.id === areaId);
  if (!area) return state;

  if (state.selectedAction === "evacuate") return evacuateArea(state, areaId);
  if (state.selectedAction === "lock") return lockArea(state, areaId);
  if (state.selectedAction === "drain") return drainArea(state, areaId);

  return state;
}

function evacuateArea(state: GameState, areaId: AreaId): GameState {
  const area = state.areas.find((item) => item.id === areaId);
  if (!area) return state;
  if (area.id === "shelter") {
    return { ...state, message: "风险行动：高地避险点是安全转移目的地，不能从这里疏散。" };
  }
  if (area.residents <= 0) {
    return { ...state, message: `低效行动：${area.name}已无待转移居民。` };
  }

  const baseCount = state.warningIssued ? scoringRules.warningEvacuateCount : scoringRules.normalEvacuateCount;
  const capacity = area.risk === "高危" ? Math.ceil(baseCount * scoringRules.highRiskEvacuateMultiplier) : baseCount;
  const moved = Math.min(capacity, area.residents);
  const nextAreas = state.areas.map((item) => {
    if (item.id === areaId) return { ...item, residents: item.residents - moved };
    if (item.id === "shelter") return { ...item, residents: item.residents + moved };
    return item;
  });

  return spendPoint({
    ...state,
    areas: nextAreas,
    finalTransferDone: state.finalTransferDone || state.round === 3,
    selectedAction: null,
    status: "playing",
    message: getActionFeedback(state, "evacuate", area, moved)
  });
}

function lockArea(state: GameState, areaId: AreaId): GameState {
  const area = state.areas.find((item) => item.id === areaId);
  if (!area) return state;
  if (area.id === "shelter") {
    return { ...state, message: "低效行动：高地避险点是转移目的地，不能封锁。" };
  }
  if (area.locked) {
    return { ...state, message: "低效行动：该区域已经封锁。" };
  }

  const nextAreas = state.areas.map((item) => (item.id === areaId ? { ...item, locked: true } : item));
  const isKeyLock = scoringRules.keyLockAreaIds.includes(areaId);
  const boundaryControlDone = state.boundaryControlDone || (state.round === 2 && (areaId === "garage" || areaId === "underpass"));

  return spendPoint({
    ...state,
    areas: nextAreas,
    boundaryControlDone,
    lockCount: state.lockCount + 1,
    keyLockCount: state.keyLockCount + (isKeyLock ? 1 : 0),
    selectedAction: null,
    status: "playing",
    message: getActionFeedback(state, "lock", area)
  });
}

function drainArea(state: GameState, areaId: AreaId): GameState {
  const area = state.areas.find((item) => item.id === areaId);
  if (!area) return state;
  if (area.id !== "lowland" && area.id !== "garage") {
    return { ...state, message: "低效行动：开启排水只适用于低洼街区或地下车库。" };
  }

  if (area.risk === "安全") {
    return spendPoint({
      ...state,
      selectedAction: null,
      status: "playing",
      message: `低效行动：${area.name}当前没有明显积水，排水暂无效果。`
    });
  }

  if (area.risk === "高危") {
    return spendPoint({
      ...state,
      selectedAction: null,
      status: "playing",
      message: "风险行动：水位过高，排水效果有限，人员仍可能被困。"
    });
  }

  const nextAreas = state.areas.map((item) => (item.id === areaId ? { ...item, risk: lowerRisk(item.risk) } : item));
  return spendPoint({
    ...state,
    areas: nextAreas,
    selectedAction: null,
    status: "playing",
    message: getActionFeedback(state, "drain", area)
  });
}

function spendPoint(nextState: GameState): GameState {
  const nextPoints = Math.max(0, nextState.actionPoints - 1);
  const spentState = { ...nextState, actionPoints: nextPoints };
  if (nextPoints === 0) return resolveRound(spentState);
  return spentState;
}

function resolveRound(state: GameState): GameState {
  if (state.status === "event" || state.status === "finished") return state;
  const event = floodEvents[state.round - 1];
  const floodedAreas = applyFloodEvent(state.areas, state.round);
  const settlement = settleTrapped(floodedAreas, state);
  const settlementText =
    settlement.trappedThisRound > 0
      ? `本回合新增 ${settlement.trappedThisRound} 人被困。高危区域中的未转移居民仍面临风险。`
      : "本回合没有新增被困人员，但风险窗口仍在收窄。";
  const judgement = getRoundJudgement(state);
  const brief = roundBriefs[state.round - 1];

  return {
    ...state,
    areas: settlement.areas,
    trapped: (state.trapped || 0) + settlement.trappedThisRound,
    actionPoints: 0,
    selectedAction: null,
    status: "event",
    message: settlementText,
    eventReport: {
      title: event.title,
      text: event.text,
      trappedThisRound: settlement.trappedThisRound,
      settlement: settlementText,
      warning: judgement,
      next: brief.next,
      affectedAreaIds: event.affectedAreaIds
    }
  };
}

function applyFloodEvent(areas: GameArea[], round: number): GameArea[] {
  if (round === 1) {
    return areas.map((area) => (area.id === "riverbank" || area.id === "lowland" ? { ...area, risk: raiseRisk(area.risk) } : area));
  }

  if (round === 2) {
    return areas.map((area) => {
      if (area.id === "garage" || area.id === "lowland") return { ...area, risk: "高危" };
      if (area.id === "underpass") return { ...area, risk: "积水" };
      return area;
    });
  }

  return areas.map((area) => {
    if (area.id === "riverbank" || area.id === "lowland" || area.id === "garage" || area.id === "underpass") return { ...area, risk: "高危" };
    if (area.id === "residential") return { ...area, risk: raiseRisk(area.risk) };
    return area;
  });
}

function settleTrapped(areas: GameArea[], state: GameState) {
  let trappedThisRound = 0;
  const nextAreas = areas.map((area) => {
    if (area.id === "shelter" || area.risk !== "高危" || area.residents <= 0) return area;
    const isUncontrolledUnderground = (area.id === "garage" || area.id === "underpass") && !state.boundaryControlDone && state.round >= 2;
    const rate = area.locked
      ? scoringRules.trappedRateLocked
      : isUncontrolledUnderground
        ? scoringRules.trappedRateUncontrolledUnderground
        : scoringRules.trappedRateUnlocked;
    const trapped = Math.ceil(area.residents * rate);
    trappedThisRound += trapped;
    return { ...area, residents: Math.max(0, area.residents - trapped) };
  });

  return { areas: nextAreas, trappedThisRound };
}

function raiseRisk(risk: RiskLevel): RiskLevel {
  const index = riskLevels.indexOf(risk);
  return riskLevels[Math.min(index + 1, riskLevels.length - 1)];
}

function lowerRisk(risk: RiskLevel): RiskLevel {
  const index = riskLevels.indexOf(risk);
  return riskLevels[Math.max(index - 1, 0)];
}

function getResult(state: GameState) {
  const evacuated = getShelterResidents(state.areas);
  const judgementCount = getJudgementCount(state);
  if (state.trapped > 12 || evacuated < 25 || judgementCount === 0) return resultTypes[3];
  if (judgementCount >= 2 && evacuated >= 35 && state.trapped <= 8 && state.finalTransferDone) return resultTypes[0];
  if (evacuated >= 30 && (judgementCount < 2 || !state.earlyRiskDone)) return resultTypes[1];
  if (state.observeCount >= 2 && evacuated < 30) return resultTypes[2];
  return resultTypes[1];
}

function getShelterResidents(areas: GameArea[]) {
  return areas.find((area) => area.id === "shelter")?.residents || 0;
}

function getAbilityScores(state: GameState) {
  const evacuated = getShelterResidents(state.areas);
  const judgementCount = getJudgementCount(state);
  return {
    risk: state.observeCount >= 2 ? "高" : state.observeCount === 1 ? "中" : "待提升",
    boundary: state.lockCount >= 3 && state.keyLockCount >= 2 ? "高" : state.lockCount >= 1 ? "中" : "待提升",
    efficiency: evacuated >= 35 && state.warningIssued && state.supportEffective ? "高" : evacuated >= 25 ? "中" : "待提升",
    judgement: `${judgementCount} / 3`
  };
}

function getJudgementCount(state: GameState) {
  return [state.earlyRiskDone, state.boundaryControlDone, state.finalTransferDone].filter(Boolean).length;
}

function getRoundJudgement(state: GameState) {
  if (state.round === 1) {
    return state.earlyRiskDone
      ? "你已经注意到水势变化，下一回合能更早判断地下空间风险。"
      : "你还没有弄清水势走向，城区也没有收到预警。下一回合风险会变得更难判断。";
  }

  if (state.round === 2) {
    return state.boundaryControlDone
      ? "关键危险区已经封锁，人员误入风险下降。"
      : "地下空间没有及时管控。倒灌发生后，人员误入风险上升。";
  }

  return state.finalTransferDone
    ? "你在最后窗口期组织了转移，减少了滞留风险。"
    : "最后转移窗口已经关闭。仍在高危区域的人将面临更大被困风险。";
}

function getObservationNote(state: GameState) {
  if (state.round === 1) return "风险线索已更新：水流正在向低洼街区和地下空间聚集。";
  if (state.round === 2 && !state.earlyRiskDone) return "";
  if (state.round === 2) return "风险线索已更新：地下空间和下穿通道水位持续上升。";
  return "风险线索已更新：高危区滞留风险正在快速扩大。";
}

function getActionFeedback(state: GameState, actionId: ActionId, area?: GameArea, moved?: number) {
  if (actionId === "observe") {
    if (state.round === 1) return "有效行动：你看清了水流正在向低洼街区和地下空间聚集。接下来的判断会更准确。";
    if (state.round === 2) return "低效行动：你确认了地下空间正在倒灌，但如果不及时管控，人员误入风险仍会上升。";
    return "低效行动：你再次确认了风险方向，但此时内涝已经加剧，单纯观察已经难以改变局面。";
  }

  if (actionId === "warn") {
    if (state.round === 1) return "有效行动：预警提前发出，居民开始准备转移。后续疏散效率提升。";
    if (state.round === 3) return "低效行动：预警可以提醒更多人，但此时高危区域已经形成，单靠提醒已经不够。";
    return "有效行动：预警继续扩散，居民配合转移的意愿提升。";
  }

  if (actionId === "support") {
    if (state.round === 1) return "低效行动：支援请求已经发出，但水势方向仍不清楚，下一步判断会更吃紧。";
    if (state.round === 2 && !state.boundaryControlDone) return "风险行动：支援请求已发出，但当前危险区域仍未管控，地下空间风险继续扩大。";
    return "有效行动：支援请求已发出，下一回合可用行动点增加。";
  }

  if (actionId === "evacuate" && area) {
    if (state.round === 1 && !state.earlyRiskDone) {
      return `低效行动：已将${area.name} ${moved} 名居民转移至高地避险点，但由于尚未判断水势，可能遗漏真正危险的区域。`;
    }
    if (state.round === 3) {
      return `有效行动：你抓住了最后窗口，将${area.name} ${moved} 名居民转移至高地避险点。`;
    }
    return `有效行动：已将${area.name} ${moved} 名居民转移至高地避险点。`;
  }

  if (actionId === "lock" && area) {
    if (state.round === 2 && area.id === "garage") return "有效行动：地下车库已封锁。倒灌发生时，人员误入风险下降。";
    if (state.round === 2 && area.id === "underpass") return "有效行动：下穿通道已封锁。低洼交通通道的误入风险下降。";
    if (area.id === "garage" || area.id === "underpass" || area.id === "riverbank") return `${state.round === 3 ? "低效行动" : "有效行动"}：${area.name}已封锁，人员误入风险下降。`;
    return `低效行动：${area.name}已封锁，但当前更大的风险仍集中在低洼、地下和临水区域。`;
  }

  if (actionId === "drain" && area) {
    if (state.round === 3) return `风险行动：${area.name}水位已接近高危，排水只能暂时缓解，仍需关注人员滞留。`;
    return `有效行动：排水系统启动，${area.name}水位暂时下降。`;
  }

  return "请根据风险线索选择行动。";
}

function isAreaSelectable(area: GameArea, selectedAction: ActionId | null) {
  if (!selectedAction) return false;
  if (selectedAction === "evacuate") return area.id !== "shelter" && area.residents > 0;
  if (selectedAction === "lock") return area.id !== "shelter" && !area.locked;
  if (selectedAction === "drain") return area.id === "lowland" || area.id === "garage";
  return false;
}

export function FloodGame({ onBack, onDecode }: { onBack: () => void; onDecode: () => void }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState);
  const [showGuide, setShowGuide] = useState(true);
  const selectedAction = actionCards.find((action) => action.id === state.selectedAction);
  const result = getResult(state);
  const scores = getAbilityScores(state);
  const evacuated = getShelterResidents(state.areas);
  const eventAffectedIds = state.eventReport?.affectedAreaIds || [];
  const roundBrief = roundBriefs[state.round - 1] || roundBriefs[0];
  const judgementCount = getJudgementCount(state);

  if (state.status === "finished") {
    return (
      <section className="screen flood-game">
        <div className="flood-result">
          <p className="kicker">{floodGameText.resultTitle}</p>
          <h2>{result.title}</h2>
          <p>{result.text}</p>
          <div className="flood-score-grid">
            <Metric label="疏散人数" value={`${evacuated} 人`} />
            <Metric label="被困人数" value={`${state.trapped} 人`} />
            <Metric label="关键判断" value={scores.judgement} />
            <Metric label="识险能力" value={scores.risk} />
            <Metric label="边界判断" value={scores.boundary} />
            <Metric label="行动效率" value={scores.efficiency} />
          </div>
          <section className="judgement-review" aria-label={floodGameText.judgementReviewTitle}>
            <h3>{floodGameText.judgementReviewTitle}</h3>
            <ReviewItem done={state.earlyRiskDone} title={judgementReviews.earlyRisk.title} doneText={judgementReviews.earlyRisk.done} missedText={judgementReviews.earlyRisk.missed} />
            <ReviewItem done={state.boundaryControlDone} title={judgementReviews.boundaryControl.title} doneText={judgementReviews.boundaryControl.done} missedText={judgementReviews.boundaryControl.missed} />
            <ReviewItem done={state.finalTransferDone} title={judgementReviews.finalTransfer.title} doneText={judgementReviews.finalTransfer.done} missedText={judgementReviews.finalTransfer.missed} />
          </section>
          <button className="primary-btn wide" type="button" onClick={onDecode}>
            {floodGameText.viewDecode}
          </button>
          <button
            className="secondary-btn wide"
            type="button"
            onClick={() => {
              dispatch({ type: "RESET" });
              setShowGuide(true);
            }}
          >
            {floodGameText.restart}
          </button>
          <button className="ghost-btn wide" type="button" onClick={onBack}>
            {floodGameText.backVolume}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="screen flood-game">
      <div className="topbar">
        <button className="back-btn" type="button" onClick={onBack} aria-label={floodGameText.backVolume}>
          ‹
        </button>
        <span className="topbar-label">{floodGameText.backVolume}</span>
        <span />
      </div>
      <header className="flood-head">
        <p className="kicker">{floodGameText.subtitle}</p>
        <h2>{floodGameText.title}</h2>
        <p className="transfer-tip">{floodGameText.transferTip}</p>
        <div className="round-intel">
          <strong>{roundBrief.title}</strong>
          <p>{roundBrief.situation}</p>
          <dl>
            <div>
              <dt>{floodGameText.clueLabel}</dt>
              <dd>{roundBrief.clue}</dd>
            </div>
            <div>
              <dt>{floodGameText.goalLabel}</dt>
              <dd>{roundBrief.goal}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="flood-dashboard" aria-label="推演状态条">
        <Metric label={floodGameText.roundLabel} value={`第 ${state.round} / 3 回合`} />
        <Metric label={floodGameText.apLabel} value={`${state.actionPoints} / ${state.maxActionPoints}`} />
        <Metric label={floodGameText.evacuatedLabel} value={`${evacuated} 人`} />
        <Metric label={floodGameText.trappedLabel} value={`${state.trapped} 人`} />
        <Metric label={floodGameText.judgementLabel} value={`${judgementCount} / 3`} />
      </div>

      <div className={`flood-map round-${state.round} ${state.status === "selecting" ? "is-targeting" : ""}`} aria-label="古地图式城市风险推演图">
        <svg className="map-lines" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <defs>
            <marker id="water-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2f6f83" opacity="0.78" />
            </marker>
          </defs>
          <path className="river-line" d="M 3 18 C 18 28, 26 38, 33 51 S 49 70, 69 76 S 90 77, 98 91" />
          <path className="flow-arrow flow-one" d="M 17 30 C 27 38, 32 47, 38 56" />
          <path className="flow-arrow flow-two" d="M 47 63 C 57 68, 66 70, 76 73" />
          <path className="flood-front front-one" d="M 8 24 C 19 32, 26 40, 34 50" />
          <path className="flood-front front-two" d="M 34 53 C 45 61, 58 66, 74 68" />
          <path className="flood-front front-three" d="M 15 77 C 37 69, 61 86, 91 66" />
          <path className="ridge-line" d="M 61 12 C 72 10, 82 12, 94 18" />
          <path className="boundary-line" d="M 12 70 C 30 64, 52 84, 82 61" />
        </svg>
        <span className="map-label river-label">河道</span>
        <span className="map-label shelter-label">高地</span>
        <span className="map-label low-label">低洼带</span>
        {state.status === "selecting" && selectedAction && (
          <div className="target-banner">
            <strong>{floodGameText.selectingPrefix}：{selectedAction.title}</strong>
            <span>{selectedAction.targetHint || floodGameText.targetHint}</span>
            <button type="button" onClick={() => dispatch({ type: "CLEAR_SELECTION" })}>{floodGameText.cancelAction}</button>
          </div>
        )}
        {state.areas.map((area) => {
          const selectable = isAreaSelectable(area, state.selectedAction);
          const muted = Boolean(state.selectedAction) && !selectable;
          const affected = eventAffectedIds.includes(area.id);
          return (
            <button
              className={`area-node risk-${riskLevels.indexOf(area.risk)} ${area.id === "shelter" ? "is-shelter" : ""} ${area.locked ? "is-locked" : ""} ${selectable ? "is-selectable" : ""} ${muted ? "is-muted" : ""} ${affected ? "is-affected" : ""}`}
              type="button"
              key={area.id}
              style={areaPositions[area.id]}
              disabled={Boolean(state.selectedAction) && !selectable}
              onClick={() => dispatch({ type: "PICK_AREA", areaId: area.id })}
            >
              <strong>{area.name}</strong>
              <span className="risk-pill">{area.risk}</span>
              <small>{area.residents} 人</small>
              <em>{area.locked ? floodGameText.lockedLabel : floodGameText.unlockedLabel}</em>
              {area.focus && <i>{floodGameText.focusLabel}</i>}
            </button>
          );
        })}
        <div className="map-feedback">
          <strong>{state.status === "selecting" ? selectedAction?.title : "现场反馈"}</strong>
          <span>{state.message}</span>
          {state.forecast && <small>{state.forecast}</small>}
        </div>
      </div>

      <div className="action-grid">
        {actionCards.map((action) => {
          const completed = (action.id === "warn" && state.warningIssued) || (action.id === "support" && state.supportUsed);
          const disabled =
            state.status !== "playing" ||
            state.actionPoints <= 0 ||
            completed ||
            (action.id === "support" && state.round >= 3);
          return (
            <button className={`action-card ${completed ? "is-done" : ""}`} type="button" key={action.id} disabled={disabled} onClick={() => dispatch({ type: "PICK_ACTION", actionId: action.id })}>
              <strong>{action.shortTitle}</strong>
              <span>{completed ? "已完成" : action.shortDesc}</span>
            </button>
          );
        })}
      </div>

      <button className="secondary-btn wide" type="button" disabled={state.status !== "playing"} onClick={() => dispatch({ type: "END_ROUND" })}>
        {floodGameText.endRound}
      </button>

      {state.status === "event" && state.eventReport && (
        <div className="toast-backdrop" role="dialog" aria-modal="true">
          <div className="toast-card flood-event-card">
            <p className="kicker">内涝事件</p>
            <h3>{state.eventReport.title}</h3>
            <p>{state.eventReport.text}</p>
            <p>{state.eventReport.warning}</p>
            <p>{state.eventReport.settlement}</p>
            <small>{state.eventReport.next}</small>
            <button className="primary-btn wide" type="button" onClick={() => dispatch({ type: "CONTINUE_AFTER_EVENT" })}>
              {state.round >= 3 ? floodGameText.showResult : floodGameText.continue}
            </button>
          </div>
        </div>
      )}

      {showGuide && (
        <div className="toast-backdrop" role="dialog" aria-modal="true">
          <div className="toast-card flood-guide-card">
            <p className="kicker">{floodGameText.pageTitle}</p>
            <h3>{floodGameText.title}</h3>
            <p>{floodGameText.transferTip}</p>
            <p>{floodGameText.guide}</p>
            <button
              className="primary-btn wide"
              type="button"
              onClick={() => {
                setShowGuide(false);
                window.scrollTo({ top: 0, behavior: "auto" });
              }}
            >
              {floodGameText.guideButton}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flood-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReviewItem({ done, title, doneText, missedText }: { done: boolean; title: string; doneText: string; missedText: string }) {
  return (
    <article className={`review-item ${done ? "is-done" : "is-missed"}`}>
      <strong>
        {title}
        <span>{done ? "已完成" : "未完成"}</span>
      </strong>
      <p>{done ? doneText : missedText}</p>
    </article>
  );
}
