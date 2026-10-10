import { useState } from "react";
import { resolveGameUrl } from "./gameUrl";
import { buildPlayUrl, cleanGuestName, cleanRoomId, type JoinMode } from "./joinFlow";

export function App() {
  const gameUrl = resolveGameUrl(window.__FOOD_FIGHT_CONFIG__?.gameUrl, import.meta.env.VITE_GAME_URL);
  const [name, setName] = useState(() => {
    try { return localStorage.getItem("ff26-guest-name") ?? ""; } catch { return ""; }
  });
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");

  function play(mode: JoinMode) {
    if (mode === "room" && !cleanRoomId(room)) {
      setError("Enter the room code your friend shared.");
      return;
    }
    const safeName = cleanGuestName(name);
    try { localStorage.setItem("ff26-guest-name", safeName); } catch { /* Storage may be disabled. */ }
    window.location.assign(buildPlayUrl(gameUrl, window.location.origin, safeName, mode, room));
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">8-player browser arcade</p>
        <h1>Food Fight 26</h1>
        <p className="lede">Throw food. Dodge chaos. Hold the sundae. Jump into a match or invite friends for a private food fight.</p>
        <a className="repo-link" href="https://github.com/ajbergh/Food-Fight-26">View project on GitHub</a>
      </section>
      <section className="panel launch-panel" aria-label="Join a match">
        <span className="status-dot" aria-hidden="true" /> Guest play — no account needed
        <h2>Ready to throw down?</h2>
        <label htmlFor="guest-name">Player name</label>
        <input id="guest-name" maxLength={20} autoComplete="nickname" placeholder="Chef name" value={name}
          onChange={(event) => setName(event.target.value)} />
        <div className="actions">
          <button type="button" className="primary" onClick={() => play("quick")}>Quick play</button>
          <button type="button" className="secondary" onClick={() => play("private")}>Create private match</button>
        </div>
        <div className="join-divider"><span>Have a room code?</span></div>
        <label htmlFor="room-code">Join a friend</label>
        <div className="join-row">
          <input id="room-code" autoCapitalize="none" placeholder="Room code" value={room}
            onChange={(event) => { setRoom(event.target.value); setError(""); }}
            onKeyDown={(event) => { if (event.key === "Enter") play("room"); }} />
          <button type="button" className="secondary" onClick={() => play("room")}>Join</button>
        </div>
        {error && <p role="alert" className="join-error">{error}</p>}
        <p className="launch-note">Private matches are joinable by link or code; they are not password protected. Desktop controls are recommended for this alpha.</p>
      </section>
    </main>
  );
}
