import { resolveGameUrl } from "./gameUrl";

const roster = ["Pip", "Jax", "Mochi", "Zoe", "Dunk", "Kai", "Lux", "Niko"];

export function App() {
  const gameUrl = resolveGameUrl(window.__FOOD_FIGHT_CONFIG__?.gameUrl, import.meta.env.VITE_GAME_URL);
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">8-player browser arcade</p>
        <h1>Food Fight 26</h1>
        <p className="lede">
          Throw food. Dodge chaos. Hold the sundae. The first playable is deliberately small and built to prove that the match is fun before final art production begins.
        </p>
        <div className="actions">
          <a className="primary" href={gameUrl}>Play prototype</a>
          <a className="secondary" href="https://github.com/ajbergh/Food-Fight-26">View repository</a>
        </div>
      </section>

      <section className="panel">
        <div>
          <span className="status-dot" /> Prototype lobby
        </div>
        <strong>8 / 8 roster concept</strong>
        <div className="roster">
          {roster.map((name, index) => (
            <div className="player" key={name}>
              <span>{index + 1}</span>
              <b>{name}</b>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
