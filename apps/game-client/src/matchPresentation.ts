export {};

type MatchMoment = "neutral" | "round" | "control" | "overtime" | "finish";
type Team = "blue" | "red";

const eventToast = document.querySelector<HTMLElement>("#event-toast");
const matchBanner = document.querySelector<HTMLElement>("#match-banner");

let clearTimer: number | undefined;
let celebrationTimer: number | undefined;
let celebrationRoot: HTMLDivElement | undefined;

function reducedMotion() {
  return document.body.dataset.reducedMotion === "true"
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function teamFromText(value: string) {
  const upper = value.toUpperCase();
  if (upper.includes("BLUE")) return "blue" as const;
  if (upper.includes("RED")) return "red" as const;
  return undefined;
}

function removeCelebration() {
  celebrationRoot?.remove();
  celebrationRoot = undefined;
  if (celebrationTimer !== undefined) window.clearTimeout(celebrationTimer);
  celebrationTimer = undefined;
}

function spawnCelebration(team?: Team) {
  removeCelebration();
  const root = document.createElement("div");
  root.className = "match-celebration";
  root.dataset.team = team ?? "none";
  root.setAttribute("aria-hidden", "true");

  const count = reducedMotion() ? 6 : 24;
  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement("i");
    piece.style.setProperty("--piece-index", String(index));
    piece.style.setProperty("--piece-x", `${8 + ((index * 37) % 84)}%`);
    piece.style.setProperty("--piece-delay", `${(index % 8) * 0.045}s`);
    piece.style.setProperty("--piece-drift", `${((index % 7) - 3) * 18}px`);
    root.appendChild(piece);
  }

  document.body.appendChild(root);
  celebrationRoot = root;
  celebrationTimer = window.setTimeout(removeCelebration, reducedMotion() ? 900 : 2200);
}

function setMoment(moment: MatchMoment, team?: Team, duration = 0) {
  if (clearTimer !== undefined) window.clearTimeout(clearTimer);
  clearTimer = undefined;

  // Force the CSS keyframe to restart when the same team captures twice in succession.
  if (document.body.dataset.matchMoment === moment && moment !== "finish") {
    document.body.dataset.matchMoment = "neutral";
    void document.body.offsetWidth;
  }
  document.body.dataset.matchMoment = moment;
  if (team) document.body.dataset.presentationTeam = team;
  else delete document.body.dataset.presentationTeam;

  if (duration > 0 && moment !== "finish") {
    clearTimer = window.setTimeout(() => {
      document.body.dataset.matchMoment = "neutral";
      delete document.body.dataset.presentationTeam;
      clearTimer = undefined;
    }, duration);
  }
}

function handleToast() {
  const value = eventToast?.textContent?.trim() ?? "";
  if (!value) return;
  const team = teamFromText(value);

  if (/ROUND\s+\d+\s+·\s+FIGHT!/i.test(value)) {
    removeCelebration();
    setMoment("round", team, 1250);
  } else if (/OVERTIME!/i.test(value)) {
    setMoment("overtime", team, 1700);
  } else if (/TOOK THE SUNDAE/i.test(value)) {
    setMoment("control", team, 1050);
  } else if (/FINISHED/i.test(value)) {
    setMoment("finish", team);
    spawnCelebration(team);
  }
}

function handleBanner() {
  const value = matchBanner?.textContent?.trim() ?? "";
  if (!value) {
    if (document.body.dataset.matchMoment === "finish") setMoment("neutral");
    return;
  }

  const team = teamFromText(value);
  if (/WINS|ROUND OVER/i.test(value)) {
    if (document.body.dataset.matchMoment !== "finish") {
      setMoment("finish", team);
      spawnCelebration(team);
    }
  } else if (/OVERTIME/i.test(value) && document.body.dataset.matchMoment === "neutral") {
    setMoment("overtime", team);
  }
}

if (eventToast) {
  new MutationObserver(handleToast).observe(eventToast, { childList: true, characterData: true, subtree: true });
}
if (matchBanner) {
  new MutationObserver(handleBanner).observe(matchBanner, { childList: true, characterData: true, subtree: true });
}

document.body.dataset.matchMoment = "neutral";
handleBanner();
