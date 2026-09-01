const timer = document.querySelector<HTMLElement>("#timer");
const objective = document.querySelector<HTMLElement>("#objective");
const blueScore = document.querySelector<HTMLElement>("#blue-score");
const redScore = document.querySelector<HTMLElement>("#red-score");
const tomatoAmmo = document.querySelector<HTMLElement>("#tomato-ammo");
const bananaAmmo = document.querySelector<HTMLElement>("#banana-ammo");
const performanceLabel = document.querySelector<HTMLElement>("#performance");
const qualityButton = document.querySelector<HTMLButtonElement>("#quality");

let slowHighSamples = 0;
let adaptiveQualityRecovered = false;

function reducedMotion() {
  return document.body.dataset.reducedMotion === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function parseClock(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const parts = value.trim().split(":");
  if (parts.length !== 2) return Number.POSITIVE_INFINITY;
  const minutes = Number(parts[0]);
  const seconds = Number(parts[1]);
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

function recoverGraphicsIfNeeded() {
  if (!performanceLabel || !qualityButton || adaptiveQualityRecovered) return;

  const quality = qualityButton.textContent?.toLowerCase() ?? "";
  if (!quality.includes("high")) {
    slowHighSamples = 0;
    return;
  }

  const match = performanceLabel.textContent?.match(/(\d+)\s*fps/i);
  const fps = match ? Number(match[1]) : Number.NaN;
  if (!Number.isFinite(fps)) return;

  slowHighSamples = fps < 30 ? slowHighSamples + 1 : 0;
  if (slowHighSamples < 4) return;

  // High quality is opt-in, but a sustained sub-30-fps session is not a premium experience.
  // The quality cycle is high -> low -> medium, so two clicks recover to the balanced tier.
  adaptiveQualityRecovered = true;
  qualityButton.click();
  qualityButton.click();
  qualityButton.dataset.autoAdjusted = "true";
  qualityButton.title = "Graphics automatically returned to medium after sustained low frame rate. Press G to override.";
  document.body.dataset.adaptiveQuality = "recovered";
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
observeText(performanceLabel, recoverGraphicsIfNeeded);

if (objective) {
  new MutationObserver(syncObjectiveState).observe(objective, { attributes: true, attributeFilter: ["data-state"] });
}

syncClockState();
syncObjectiveState();
syncAmmoState(tomatoAmmo);
syncAmmoState(bananaAmmo);
