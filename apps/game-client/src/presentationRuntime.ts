const timer = document.querySelector<HTMLElement>("#timer");
const objective = document.querySelector<HTMLElement>("#objective");
const blueScore = document.querySelector<HTMLElement>("#blue-score");
const redScore = document.querySelector<HTMLElement>("#red-score");
const tomatoAmmo = document.querySelector<HTMLElement>("#tomato-ammo");
const bananaAmmo = document.querySelector<HTMLElement>("#banana-ammo");

function reducedMotion() {
  return document.body.dataset.reducedMotion === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function parseClock(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const [minutes, seconds] = value.trim().split(":").map(Number);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return Number.POSITIVE_INFINITY;
  return minutes * 60 + seconds;
}

function syncClockState() {
  const remaining = parseClock(timer?.textContent ?? null);
  document.body.dataset.clockState = remaining <= 10 ? "critical" : remaining <= 30 ? "warning" : "normal";
}

function syncObjectiveState() {
  document.body.dataset.objectiveState = objective?.dataset.state ?? "none";
}

function syncAmmoState(element: HTMLElement | null) {
  if (!element) return;
  const value = Number(element.textContent ?? "0");
  element.closest("span")?.toggleAttribute("data-empty", value <= 0);
}

function animateScore(element: HTMLElement | null) {
  if (!element || reducedMotion()) return;
  const panel = element.closest(".blue-score, .red-score");
  if (!(panel instanceof HTMLElement)) return;
  panel.classList.remove("score-pop");
  void panel.offsetWidth;
  panel.classList.add("score-pop");
  window.setTimeout(() => panel.classList.remove("score-pop"), 420);
}

function observeText(element: HTMLElement | null, callback: () => void) {
  if (!element) return;
  const observer = new MutationObserver(callback);
  observer.observe(element, { childList: true, characterData: true, subtree: true });
}

observeText(timer, syncClockState);
observeText(blueScore, () => animateScore(blueScore));
observeText(redScore, () => animateScore(redScore));
observeText(tomatoAmmo, () => syncAmmoState(tomatoAmmo));
observeText(bananaAmmo, () => syncAmmoState(bananaAmmo));

if (objective) {
  new MutationObserver(syncObjectiveState).observe(objective, { attributes: true, attributeFilter: ["data-state"] });
}

syncClockState();
syncObjectiveState();
syncAmmoState(tomatoAmmo);
syncAmmoState(bananaAmmo);
