import { useReducer } from "react";
import {
  actionCards,
  floodEvents,
  floodGameText,
  initialAreas,
  resultTypes,
  riskLevels,
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
  observeCount: 0,
  lockCount: 0,
  keyLockCount: 0,
  trapped: 0,
  supportEffective: false,
  areas: initialAreas.map((area) => ({ ...area, locked: false })),
  selectedAction: null,
  message: "请先判断水势，再选择行动。",
  forecast: "",
  eventReport: null,
  status: "playing"
});

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "RESET":
      return initialState();
    case "CLEAR_SELECTION":
      return { ...state, selectedAction: null, status: "playing", message: "已取消选择区域。" };
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
          message: hasSupport ? "支援力量到达，本回合行动点增加。" : "新一回合开始，请继续判断水势。"
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
    const event = floodEvents[state.round - 1];
    const affectedNames = event.affectedAreaIds.map((areaId) => state.areas.find((area) => area.id === areaId)?.name).filter(Boolean).join("、");
    return spendPoint({
      ...state,
      observeCount: state.observeCount + 1,
      forecast: `下一回合风险上升区域：${affectedNames}`,
      message: action.feedback
    });
  }

  if (actionId === "warn") {
    if (state.warningIssued) {
      return { ...state, message: action.repeated || "" };
    }

    return spendPoint({
      ...state,
      warningIssued: true,
      message: action.feedback || ""
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
      message: action.feedback || ""
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
    return { ...state, message: "高地避难点是安全转移目的地，不能从这里疏散。" };
  }
  if (area.residents <= 0) {
    return { ...state, message: `${area.name}已无待转移居民。` };
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
    selectedAction: null,
    status: "playing",
    message: `已将${area.name}的 ${moved} 名居民转移至高地避难点。`
  });
}

function lockArea(state: GameState, areaId: AreaId): GameState {
  const area = state.areas.find((item) => item.id === areaId);
  if (!area) return state;
  if (area.id === "shelter") {
    return { ...state, message: "高地避难点不能封锁。" };
  }
  if (area.locked) {
    return { ...state, message: "该区域已经封锁。" };
  }

  const nextAreas = state.areas.map((item) => (item.id === areaId ? { ...item, locked: true } : item));
  const isKeyLock = scoringRules.keyLockAreaIds.includes(areaId);

  return spendPoint({
    ...state,
    areas: nextAreas,
    lockCount: state.lockCount + 1,
    keyLockCount: state.keyLockCount + (isKeyLock ? 1 : 0),
    selectedAction: null,
    status: "playing",
    message: `${area.name}已封锁。后续洪水影响时，将减少人员误入风险。`
  });
}

function drainArea(state: GameState, areaId: AreaId): GameState {
  const area = state.areas.find((item) => item.id === areaId);
  if (!area) return state;
  if (area.id !== "lowland" && area.id !== "garage") {
    return { ...state, message: "开启排水只适用于低洼街区或地下车库。" };
  }

  if (area.risk === "安全") {
    return spendPoint({
      ...state,
      selectedAction: null,
      status: "playing",
      message: `${area.name}当前没有积水，排水暂无效果。`
    });
  }

  if (area.risk === "高危") {
    return spendPoint({
      ...state,
      selectedAction: null,
      status: "playing",
      message: "水位过高，排水效果有限。"
    });
  }

  const nextAreas = state.areas.map((item) => (item.id === areaId ? { ...item, risk: lowerRisk(item.risk) } : item));
  return spendPoint({
    ...state,
    areas: nextAreas,
    selectedAction: null,
    status: "playing",
    message: `排水系统启动，${area.name}水位暂时下降。`
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
  const settlement = settleTrapped(floodedAreas);
  const settlementText =
    settlement.trappedThisRound > 0
      ? `本回合洪水造成 ${settlement.trappedThisRound} 人被困。高危区域中的未转移居民仍面临风险。`
      : "本回合没有新增被困人员。前期识险和转移正在发挥作用。";

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
      settlement: settlementText
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

function settleTrapped(areas: GameArea[]) {
  let trappedThisRound = 0;
  const nextAreas = areas.map((area) => {
    if (area.id === "shelter" || area.risk !== "高危" || area.residents <= 0) return area;
    const rate = area.locked ? scoringRules.trappedRateLocked : scoringRules.trappedRateUnlocked;
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
  if (evacuated >= 35 && state.trapped <= 8 && state.observeCount >= 1) return resultTypes[0];
  if (evacuated >= 30 && (state.observeCount === 0 || state.lockCount < 2)) return resultTypes[1];
  if (state.observeCount >= 2 && evacuated < 30) return resultTypes[2];
  if (state.trapped > 12 || evacuated < 25) return resultTypes[3];
  return resultTypes[1];
}

function getShelterResidents(areas: GameArea[]) {
  return areas.find((area) => area.id === "shelter")?.residents || 0;
}

function getAbilityScores(state: GameState) {
  const evacuated = getShelterResidents(state.areas);
  return {
    risk: state.observeCount >= 2 ? "高" : state.observeCount === 1 ? "中" : "待提升",
    boundary: state.lockCount >= 3 && state.keyLockCount >= 2 ? "高" : state.lockCount >= 1 ? "中" : "待提升",
    efficiency: evacuated >= 35 && state.warningIssued && state.supportEffective ? "高" : evacuated >= 25 ? "中" : "待提升"
  };
}

export function FloodGame({ onBack, onDecode }: { onBack: () => void; onDecode: () => void }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState);
  const selectedAction = actionCards.find((action) => action.id === state.selectedAction);
  const result = getResult(state);
  const scores = getAbilityScores(state);
  const evacuated = getShelterResidents(state.areas);

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
            <Metric label="识险能力" value={scores.risk} />
            <Metric label="边界判断" value={scores.boundary} />
            <Metric label="行动效率" value={scores.efficiency} />
          </div>
          <button className="primary-btn wide" type="button" onClick={onDecode}>
            {floodGameText.viewDecode}
          </button>
          <button className="secondary-btn wide" type="button" onClick={() => dispatch({ type: "RESET" })}>
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
        <p className="kicker">{floodGameText.pageTitle}</p>
        <h2>{floodGameText.title}</h2>
        <p>{floodGameText.background}</p>
      </header>

      <div className="flood-dashboard">
        <Metric label={floodGameText.roundLabel} value={`第 ${state.round} / 3 回合`} />
        <Metric label={floodGameText.apLabel} value={`${state.actionPoints} / ${state.maxActionPoints}`} />
        <Metric label={floodGameText.evacuatedLabel} value={`${evacuated} 人`} />
        <Metric label={floodGameText.trappedLabel} value={`${state.trapped} 人`} />
      </div>

      <div className="flood-message">
        <strong>{state.status === "selecting" ? selectedAction?.title : "现场反馈"}</strong>
        <span>{state.message}</span>
        {state.forecast && <small>{state.forecast}</small>}
      </div>

      <div className="flood-map" aria-label="城市风险推演图">
        {state.areas.map((area) => (
          <button
            className={`area-card risk-${riskLevels.indexOf(area.risk)} ${area.locked ? "is-locked" : ""} ${state.selectedAction ? "is-selectable" : ""}`}
            type="button"
            key={area.id}
            onClick={() => dispatch({ type: "PICK_AREA", areaId: area.id })}
          >
            <strong>{area.name}</strong>
            <span>{area.risk}</span>
            <small>{area.residents} 人</small>
            <em>{area.locked ? floodGameText.lockedLabel : floodGameText.unlockedLabel}</em>
            {area.focus && <i>{floodGameText.focusLabel}</i>}
          </button>
        ))}
      </div>

      {state.status === "selecting" && (
        <button className="ghost-btn wide" type="button" onClick={() => dispatch({ type: "CLEAR_SELECTION" })}>
          取消选择
        </button>
      )}

      <div className="action-grid">
        {actionCards.map((action) => {
          const disabled = state.status !== "playing" || state.actionPoints <= 0 || (action.id === "support" && (state.supportUsed || state.round >= 3));
          return (
            <button className="action-card" type="button" key={action.id} disabled={disabled} onClick={() => dispatch({ type: "PICK_ACTION", actionId: action.id })}>
              <strong>{action.title}</strong>
              <span>{action.desc}</span>
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
            <p className="kicker">洪水事件</p>
            <h3>{state.eventReport.title}</h3>
            <p>{state.eventReport.text}</p>
            <p>{state.eventReport.settlement}</p>
            <button className="primary-btn wide" type="button" onClick={() => dispatch({ type: "CONTINUE_AFTER_EVENT" })}>
              {state.round >= 3 ? floodGameText.showResult : floodGameText.continue}
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
