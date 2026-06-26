import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { gonggongVolume, quiz, riskDecode, theater, uiText, volumes } from "./content";
import { floodGameText } from "./content/floodGame";
import { FloodGame } from "./modules/FloodGame";

type Page = "splash" | "overview" | "volume" | "theater" | "decode" | "quiz" | "result" | "floodGame";

function App() {
  const [page, setPage] = useState<Page>("splash");
  const [toast, setToast] = useState("");
  const [comicIndex, setComicIndex] = useState(0);
  const [comicTip, setComicTip] = useState("");
  const [comicAnswer, setComicAnswer] = useState<number | null>(null);
  const [decodeIndex, setDecodeIndex] = useState(0);
  const [expandedCards, setExpandedCards] = useState<number[]>([0]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const score = quizAnswers.reduce((total, answer, index) => {
    return total + (quiz.questions[index]?.options[answer]?.isCorrect ? 1 : 0);
  }, 0);

  const result = useMemo(() => {
    return quiz.results.find((item) => score >= item.min && score <= item.max) || quiz.results[quiz.results.length - 1];
  }, [score]);

  function navigate(nextPage: Page) {
    if (nextPage === "theater") {
      setComicIndex(0);
      setComicTip("");
      setComicAnswer(null);
    }

    if (nextPage === "quiz") {
      setQuizIndex(0);
      setQuizAnswers([]);
    }

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showUnavailable() {
    setToast(uiText.unavailableMessage);
  }

  function closeToast() {
    setToast("");
  }

  return (
    <main className={`app page-${page}`} aria-live="polite">
      {page === "splash" && <SplashPage onEnter={() => navigate("overview")} />}
      {page === "overview" && <OverviewPage onBack={() => navigate("splash")} onOpen={() => navigate("volume")} onUnavailable={showUnavailable} />}
      {page === "volume" && <VolumePage onBack={() => navigate("overview")} onGo={navigate} />}
      {page === "floodGame" && <FloodGame onBack={() => navigate("volume")} onDecode={() => navigate("decode")} />}
      {page === "theater" && (
        <TheaterPage
          index={comicIndex}
          tip={comicTip}
          answer={comicAnswer}
          onBack={() => navigate("volume")}
          onTip={setComicTip}
          onAnswer={setComicAnswer}
          onNext={() => {
            setComicIndex((current) => Math.min(current + 1, theater.comics.length - 1));
            setComicTip("");
          }}
        />
      )}
      {page === "decode" && (
        <DecodePage
          activeIndex={decodeIndex}
          expandedCards={expandedCards}
          onBack={() => navigate("volume")}
          onSelect={setDecodeIndex}
          onToggle={(index) => {
            setExpandedCards((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]));
          }}
        />
      )}
      {page === "quiz" && (
        <QuizPage
          index={quizIndex}
          answers={quizAnswers}
          onBack={() => navigate("volume")}
          onAnswer={(answer) => setQuizAnswers((current) => [...current.slice(0, quizIndex), answer])}
          onNext={() => {
            if (quizIndex === quiz.questions.length - 1) {
              navigate("result");
              return;
            }
            setQuizIndex((current) => current + 1);
          }}
        />
      )}
      {page === "result" && (
        <ResultPage
          score={score}
          title={result.title}
          text={result.text}
          onRestart={() => navigate("quiz")}
          onVolume={() => navigate("volume")}
          onOverview={() => navigate("overview")}
        />
      )}
      <VersionFooter />
      {toast && <Toast message={toast} onClose={closeToast} />}
    </main>
  );
}

function VersionFooter() {
  return <footer className="version-footer">{uiText.versionFooter}</footer>;
}

function TopBar({ onBack, label }: { onBack?: () => void; label?: string }) {
  return (
    <div className="topbar">
      {onBack ? (
        <button className="back-btn" type="button" onClick={onBack} aria-label={label || "返回"}>
          ‹
        </button>
      ) : (
        <span />
      )}
      <span className="topbar-label">{label || ""}</span>
      <span />
    </div>
  );
}

function SplashPage({ onEnter }: { onEnter: () => void }) {
  return (
    <section
      className="screen splash-screen"
      style={{ "--splash-bg": `url(${uiText.splashBackground})` } as CSSProperties}
    >
      <div className="splash-paper" />
      <div className="splash-inner">
        <p className="kicker">{uiText.seriesLabel}</p>
        <h1>{uiText.projectName}</h1>
        <p className="splash-subtitle">{uiText.splashSubtitle}</p>
        <button className="primary-btn" type="button" onClick={onEnter}>
          {uiText.enterButton}
        </button>
      </div>
    </section>
  );
}

function OverviewPage({ onBack, onOpen, onUnavailable }: { onBack: () => void; onOpen: () => void; onUnavailable: () => void }) {
  return (
    <section className="screen">
      <TopBar onBack={onBack} label={uiText.projectName} />
      <header className="page-head">
        <p className="kicker">{uiText.seriesLabel}</p>
        <h2>{uiText.overviewTitle}</h2>
      </header>
      <div className="volume-list">
        {volumes.map((volume) => (
          <button
            className={`volume-card ${volume.isOpen ? "is-open" : "is-locked"}`}
            type="button"
            key={volume.id}
            onClick={volume.isOpen ? onOpen : onUnavailable}
          >
            <span className="volume-status">{volume.isOpen ? volume.status : `${uiText.lockedHint} · ${volume.status}`}</span>
            <span className="volume-order">{volume.order}</span>
            <strong>
              {volume.title}
              <em>{volume.subtitle}</em>
            </strong>
            <span className="meta-line">{uiText.mythLabel}：{volume.myth}</span>
            <span className="tag-row">
              <span>{volume.keyword}</span>
              <small>{volume.disaster}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function VolumePage({ onBack, onGo }: { onBack: () => void; onGo: (page: Page) => void }) {
  return (
    <section className="screen">
      <TopBar onBack={onBack} label={uiText.backOverview} />
      <article className="volume-detail">
        <p className="kicker">{gonggongVolume.keyword}</p>
        <h2>{gonggongVolume.title}</h2>
        <h3>{gonggongVolume.subtitle}</h3>
        <div className="detail-grid">
          <span>{uiText.mythLabel}：{gonggongVolume.myth}</span>
          <span>{uiText.disasterLabel}：{gonggongVolume.disaster}</span>
        </div>
        <p>{gonggongVolume.intro}</p>
      </article>
      <div className="entry-list">
        {gonggongVolume.entries.map((entry) => (
          <article className="entry-card" key={entry.id}>
            <div>
              <h3>{entry.title}</h3>
              <p>{entry.desc}</p>
            </div>
            <button className="secondary-btn" type="button" onClick={() => onGo(entry.id as Page)}>
              {entry.button}
            </button>
          </article>
        ))}
        <article className="entry-card flood-test-entry">
          <div>
            <p className="kicker">临时测试入口</p>
            <h3>{floodGameText.testEntryTitle}</h3>
            <p>{floodGameText.testEntryDesc}</p>
          </div>
          <button className="secondary-btn" type="button" onClick={() => onGo("floodGame")}>
            {floodGameText.testEntryButton}
          </button>
        </article>
      </div>
    </section>
  );
}

function TheaterPage({
  index,
  tip,
  answer,
  onBack,
  onTip,
  onAnswer,
  onNext
}: {
  index: number;
  tip: string;
  answer: number | null;
  onBack: () => void;
  onTip: (tip: string) => void;
  onAnswer: (answer: number) => void;
  onNext: () => void;
}) {
  const comic = theater.comics[index];
  const isLast = index === theater.comics.length - 1;
  const selected = answer === null ? null : theater.question.options[answer];

  return (
    <section className="screen">
      <TopBar onBack={onBack} label={uiText.backVolume} />
      <header className="page-head compact">
        <p className="kicker">{uiText.theaterLabel}</p>
        <h2>{theater.title}</h2>
        <span className="progress">{index + 1} / {theater.comics.length}</span>
      </header>
      <article className="comic-stage">
        <img src={comic.image} alt={comic.title} />
        <button
          className="hotspot"
          type="button"
          style={{ left: `${comic.hotspot.x}%`, top: `${comic.hotspot.y}%` }}
          onClick={() => onTip(comic.hotspot.label)}
          aria-label="查看提示"
        />
        {tip && (
          <div className="bubble" style={{ left: `${Math.min(comic.hotspot.x, 64)}%`, top: `${Math.min(comic.hotspot.y + 5, 76)}%` }}>
            {tip}
          </div>
        )}
      </article>
      <article className="paper-card">
        <h3>{comic.title}</h3>
        <p>{comic.text}</p>
        {!isLast && (
          <button className="primary-btn wide" type="button" onClick={onNext}>
            {uiText.nextPanel}
          </button>
        )}
        {isLast && (
          <div className="question-block">
            <h3>{theater.question.title}</h3>
            <div className="option-list">
              {theater.question.options.map((option, optionIndex) => (
                <button
                  className={`option ${answer === optionIndex ? (option.isCorrect ? "is-good" : "is-bad") : ""}`}
                  type="button"
                  key={option.text}
                  onClick={() => onAnswer(optionIndex)}
                >
                  {uiText.answerPrefix[optionIndex]}. {option.text}
                </button>
              ))}
            </div>
            {selected && <p className="feedback">{selected.feedback}</p>}
          </div>
        )}
      </article>
    </section>
  );
}

function DecodePage({
  activeIndex,
  expandedCards,
  onBack,
  onSelect,
  onToggle
}: {
  activeIndex: number;
  expandedCards: number[];
  onBack: () => void;
  onSelect: (index: number) => void;
  onToggle: (index: number) => void;
}) {
  return (
    <section className="screen">
      <TopBar onBack={onBack} label={uiText.backVolume} />
      <header className="page-head compact">
        <p className="kicker">{riskDecode.title}</p>
        <h2>{riskDecode.subtitle}</h2>
      </header>
      <div className="decode-nav">
        {riskDecode.cards.map((card, index) => (
          <button className={activeIndex === index ? "active" : ""} type="button" key={card.title} onClick={() => onSelect(index)}>
            {index + 1}
          </button>
        ))}
      </div>
      <div className="decode-list">
        {riskDecode.cards.map((card, index) => {
          const isExpanded = expandedCards.includes(index);
          return (
            <article className={`decode-card ${activeIndex === index ? "active" : ""}`} key={card.title}>
              <button
                className="decode-title"
                type="button"
                onClick={() => {
                  onSelect(index);
                  onToggle(index);
                }}
              >
                <span>{card.title}</span>
                <small>{isExpanded ? uiText.collapse : uiText.expand}</small>
              </button>
              {isExpanded && (
                <div className="decode-body">
                  <p><strong>{uiText.mythMeaning}</strong>{card.myth}</p>
                  <p><strong>{uiText.realityMapping}</strong>{card.reality}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function QuizPage({
  index,
  answers,
  onBack,
  onAnswer,
  onNext
}: {
  index: number;
  answers: number[];
  onBack: () => void;
  onAnswer: (answer: number) => void;
  onNext: () => void;
}) {
  const question = quiz.questions[index];
  const answer = answers[index];
  const selected = answer === undefined ? null : question.options[answer];
  const hasAnswered = answer !== undefined;

  return (
    <section className="screen">
      <TopBar onBack={onBack} label={uiText.backVolume} />
      <header className="page-head compact">
        <p className="kicker">{uiText.quizLabel}</p>
        <h2>{quiz.title}</h2>
        <span className="progress">{index + 1} / {quiz.questions.length}</span>
      </header>
      <article className="paper-card quiz-card">
        <h3>{question.title}</h3>
        <div className="option-list">
          {question.options.map((option, optionIndex) => (
            <button
              className={`option ${answer === optionIndex ? (option.isCorrect ? "is-good" : "is-bad") : ""}`}
              type="button"
              key={option.text}
              disabled={hasAnswered}
              onClick={() => onAnswer(optionIndex)}
            >
              {uiText.answerPrefix[optionIndex]}. {option.text}
            </button>
          ))}
        </div>
        {selected && <p className="feedback">{selected.feedback}</p>}
        {hasAnswered && (
          <button className="primary-btn wide" type="button" onClick={onNext}>
            {index === quiz.questions.length - 1 ? uiText.viewResult : uiText.nextQuestion}
          </button>
        )}
      </article>
    </section>
  );
}

function ResultPage({
  score,
  title,
  text,
  onRestart,
  onVolume,
  onOverview
}: {
  score: number;
  title: string;
  text: string;
  onRestart: () => void;
  onVolume: () => void;
  onOverview: () => void;
}) {
  return (
    <section className="screen result-screen">
      <article className="result-card">
        <p className="kicker">{uiText.resultLabel}</p>
        <h2>{title}</h2>
        <div className="score">
          <strong>{score}</strong>
          <span>/ {quiz.questions.length}</span>
        </div>
        <p>{text}</p>
        <button className="primary-btn wide" type="button" onClick={onRestart}>{uiText.restartQuiz}</button>
        <button className="secondary-btn wide" type="button" onClick={onVolume}>{uiText.backVolume}</button>
        <button className="ghost-btn wide" type="button" onClick={onOverview}>{uiText.backOverview}</button>
      </article>
    </section>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="toast-backdrop" role="dialog" aria-modal="true">
      <div className="toast-card">
        <p>{message}</p>
        <button className="primary-btn wide" type="button" onClick={onClose}>
          {uiText.toastConfirm}
        </button>
      </div>
    </div>
  );
}

export default App;
