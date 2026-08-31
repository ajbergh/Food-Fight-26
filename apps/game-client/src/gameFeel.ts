import "./palette.css";

type Cue = "tomato" | "banana" | "dodge" | "round" | "overtime" | "objective" | "finish";
type HudScale = "compact" | "normal" | "large";
type TeamPalette = "default" | "color-safe";

const audioButton = document.querySelector<HTMLButtonElement>("#audio");
const hudScaleButton = document.querySelector<HTMLButtonElement>("#hud-scale");
const motionButton = document.querySelector<HTMLButtonElement>("#motion");
const paletteButton = document.querySelector<HTMLButtonElement>("#palette");
const performanceLabel = document.querySelector<HTMLDivElement>("#performance");
const eventToast = document.querySelector<HTMLDivElement>("#event-toast");
const objective = document.querySelector<HTMLDivElement>("#objective");
const actionFlash = document.querySelector<HTMLDivElement>("#action-flash");
const canvas = document.querySelector<HTMLCanvasElement>("#game");
const motionMedia = window.matchMedia?.("(prefers-reduced-motion: reduce)");

let audioContext: AudioContext | undefined;
let masterGain: GainNode | undefined;
let muted = readMuted();
let hudScale = readHudScale();
let motionOverride = readMotionOverride();
let reducedMotion = motionOverride ?? motionMedia?.matches ?? false;
let teamPalette = readTeamPalette();
let previousToast = "";
let previousObjectiveState = objective?.dataset.state ?? "none";
let lastGamepadThrow = false;
let lastGamepadBanana = false;
let lastGamepadDodge = false;

function ensureAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = muted ? 0 : 0.28;
    masterGain.connect(audioContext.destination);
  }
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.14,
  endFrequency = frequency,
  delay = 0,
) {
  if (muted) return;
  const context = ensureAudio();
  const output = masterGain;
  if (!output) return;
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.025, duration * 0.2));
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope);
  envelope.connect(output);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playNoise(duration: number, gain = 0.06, cutoff = 1500) {
  if (muted) return;
  const context = ensureAudio();
  const output = masterGain;
  if (!output) return;
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  envelope.gain.setValueAtTime(gain, context.currentTime);
  envelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(output);
  source.start();
}

function playCue(cue: Cue) {
  if (cue === "tomato") {
    playNoise(0.09, 0.045, 2300);
    playTone(430, 0.1, "triangle", 0.08, 220);
  } else if (cue === "banana") {
    playTone(280, 0.08, "square", 0.055, 190);
    playTone(520, 0.1, "triangle", 0.05, 390, 0.045);
  } else if (cue === "dodge") {
    playNoise(0.14, 0.04, 3200);
    playTone(190, 0.13, "sawtooth", 0.035, 560);
  } else if (cue === "round") {
    playTone(330, 0.12, "square", 0.045, 330);
    playTone(495, 0.14, "square", 0.045, 495, 0.11);
    playTone(660, 0.18, "square", 0.055, 660, 0.22);
  } else if (cue === "overtime") {
    playTone(760, 0.16, "sawtooth", 0.045, 540);
    playTone(760, 0.16, "sawtooth", 0.045, 540, 0.2);
  } else if (cue === "objective") {
    playTone(440, 0.12, "triangle", 0.04, 660);
    playTone(660, 0.2, "triangle", 0.045, 880, 0.08);
  } else {
    playTone(523, 0.15, "triangle", 0.05, 523);
    playTone(659, 0.18, "triangle", 0.05, 659, 0.11);
    playTone(784, 0.28, "triangle", 0.055, 784, 0.22);
  }
}

function flash(cue: Cue) {
  if (!actionFlash || reducedMotion) return;
  actionFlash.className = "action-flash";
  void actionFlash.offsetWidth;
  actionFlash.classList.add("visible", cue);
}

function triggerLocalAction(cue: "tomato" | "banana" | "dodge") {
  playCue(cue);
  flash(cue);
}

function toggleMute() {
  muted = !muted;
  if (masterGain) masterGain.gain.value = muted ? 0 : 0.28;
  updateAudioButton();
  try {
    window.localStorage.setItem("foodfight.muted", muted ? "1" : "0");
  } catch {
    // Audio settings still work for the current session.
  }
  if (!muted) playTone(620, 0.08, "triangle", 0.04, 760);
}

function updateAudioButton() {
  if (!audioButton) return;
  audioButton.textContent = muted ? "audio · off" : "audio · on";
  audioButton.setAttribute("aria-pressed", String(muted));
}

function readMuted() {
  try {
    return window.localStorage.getItem("foodfight.muted") === "1";
  } catch {
    return false;
  }
}

function readHudScale(): HudScale {
  try {
    const stored = window.localStorage.getItem("foodfight.hudScale");
    if (stored === "compact" || stored === "normal" || stored === "large") return stored;
  } catch {
    // Use the default scale when storage is unavailable.
  }
  return "normal";
}

function applyHudScale(next: HudScale, persist = true) {
  hudScale = next;
  document.body.dataset.hudScale = next;
  if (hudScaleButton) {
    hudScaleButton.textContent = `hud · ${next}`;
    hudScaleButton.setAttribute("aria-label", `HUD scale: ${next}. Activate to cycle scale.`);
  }
  if (!persist) return;
  try {
    window.localStorage.setItem("foodfight.hudScale", next);
  } catch {
    // HUD scaling still works for the current session.
  }
}

function cycleHudScale() {
  const next: Record<HudScale, HudScale> = {
    compact: "normal",
    normal: "large",
    large: "compact",
  };
  applyHudScale(next[hudScale]);
}

function readMotionOverride(): boolean | undefined {
  try {
    const stored = window.localStorage.getItem("foodfight.reducedMotion");
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    // Fall through to the operating-system preference.
  }
  return undefined;
}

function applyReducedMotion(next: boolean, persist = true) {
  reducedMotion = next;
  document.body.dataset.reducedMotion = String(next);
  if (motionButton) {
    motionButton.textContent = next ? "motion · reduced" : "motion · full";
    motionButton.setAttribute("aria-pressed", String(next));
    motionButton.setAttribute("aria-label", next ? "Reduced motion enabled" : "Reduced motion disabled");
  }
  if (!persist) return;
  motionOverride = next;
  try {
    window.localStorage.setItem("foodfight.reducedMotion", next ? "1" : "0");
  } catch {
    // Motion preference still works for the current session.
  }
}

function toggleReducedMotion() {
  applyReducedMotion(!reducedMotion);
}

function handleSystemMotionChange(event: MediaQueryListEvent) {
  if (motionOverride !== undefined) return;
  applyReducedMotion(event.matches, false);
}

function readTeamPalette(): TeamPalette {
  try {
    if (window.localStorage.getItem("foodfight.teamPalette") === "color-safe") return "color-safe";
  } catch {
    // Use the default team palette when storage is unavailable.
  }
  return "default";
}

function applyTeamPalette(next: TeamPalette, persist = true) {
  teamPalette = next;
  document.body.dataset.teamPalette = next;
  if (paletteButton) {
    const safe = next === "color-safe";
    paletteButton.textContent = safe ? "palette · safe" : "palette · default";
    paletteButton.setAttribute("aria-pressed", String(safe));
    paletteButton.setAttribute(
      "aria-label",
      safe ? "Color-safe blue and orange team palette enabled" : "Default blue and red team palette enabled",
    );
  }
  if (persist) {
    try {
      window.localStorage.setItem("foodfight.teamPalette", next);
    } catch {
      // Team palette still works for the current session.
    }
  }
  window.dispatchEvent(new CustomEvent("foodfight:palettechange", { detail: { palette: next } }));
}

function toggleTeamPalette() {
  applyTeamPalette(teamPalette === "default" ? "color-safe" : "default");
}

function handleKeyboard(event: KeyboardEvent) {
  if (event.repeat) return;
  if (event.code === "KeyM") {
    toggleMute();
    return;
  }
  if (event.code === "KeyH") {
    cycleHudScale();
    return;
  }
  if (event.code === "KeyR") {
    toggleReducedMotion();
    return;
  }
  if (event.code === "KeyP") {
    toggleTeamPalette();
    return;
  }
  if (event.code === "Space") triggerLocalAction("tomato");
  else if (event.code === "KeyQ") triggerLocalAction("banana");
  else if (event.code === "ShiftLeft" || event.code === "ShiftRight") triggerLocalAction("dodge");
}

function handleToastMutation() {
  const text = eventToast?.textContent?.trim() ?? "";
  if (!text || text === previousToast) return;
  previousToast = text;
  if (text.includes("FIGHT")) playCue("round");
  else if (text.includes("OVERTIME")) playCue("overtime");
  else if (text.includes("TOOK THE SUNDAE")) playCue("objective");
  else if (text.includes("FINISHED")) playCue("finish");
}

function handleObjectiveMutation() {
  const next = objective?.dataset.state ?? "none";
  if (next === previousObjectiveState) return;
  previousObjectiveState = next;
  if (next !== "none" && next !== "contested") flash("objective");
}

function pollGamepad() {
  const gamepad = navigator.getGamepads?.()[0];
  if (gamepad) {
    const throwPressed = Boolean(gamepad.buttons[0]?.pressed);
    const bananaPressed = Boolean(gamepad.buttons[1]?.pressed);
    const dodgePressed = Boolean(gamepad.buttons[5]?.pressed);
    if (throwPressed && !lastGamepadThrow) triggerLocalAction("tomato");
    if (bananaPressed && !lastGamepadBanana) triggerLocalAction("banana");
    if (dodgePressed && !lastGamepadDodge) triggerLocalAction("dodge");
    lastGamepadThrow = throwPressed;
    lastGamepadBanana = bananaPressed;
    lastGamepadDodge = dodgePressed;
  } else {
    lastGamepadThrow = false;
    lastGamepadBanana = false;
    lastGamepadDodge = false;
  }
  window.requestAnimationFrame(pollGamepad);
}

function startPerformanceMeter() {
  if (!performanceLabel) return;
  let last = performance.now();
  let smoothedMs = 16.7;
  let lastDisplay = last;
  const tick = (now: number) => {
    const delta = Math.min(100, Math.max(0.1, now - last));
    last = now;
    smoothedMs = smoothedMs * 0.9 + delta * 0.1;
    if (now - lastDisplay >= 500) {
      const fps = Math.round(1000 / smoothedMs);
      performanceLabel.textContent = `${fps} fps · ${smoothedMs.toFixed(1)} ms`;
      performanceLabel.dataset.health = fps >= 55 ? "good" : fps >= 40 ? "warn" : "bad";
      lastDisplay = now;
    }
    window.requestAnimationFrame(tick);
  };
  window.requestAnimationFrame(tick);
}

updateAudioButton();
applyHudScale(hudScale, false);
applyReducedMotion(reducedMotion, false);
applyTeamPalette(teamPalette, false);
audioButton?.addEventListener("click", toggleMute);
hudScaleButton?.addEventListener("click", cycleHudScale);
motionButton?.addEventListener("click", toggleReducedMotion);
paletteButton?.addEventListener("click", toggleTeamPalette);
motionMedia?.addEventListener?.("change", handleSystemMotionChange);
window.addEventListener("keydown", handleKeyboard);
canvas?.addEventListener("pointerdown", () => triggerLocalAction("tomato"));
if (eventToast) new MutationObserver(handleToastMutation).observe(eventToast, { childList: true, characterData: true, subtree: true });
if (objective) new MutationObserver(handleObjectiveMutation).observe(objective, { attributes: true, attributeFilter: ["data-state"] });
window.requestAnimationFrame(pollGamepad);
startPerformanceMeter();
