import { describe, expect, it } from "vitest";
import { resolveObjectiveControl } from "./objective";

const center = { x: 0, y: 0 };

describe("resolveObjectiveControl", () => {
  it("awards uncontested control to the team inside the zone", () => {
    expect(resolveObjectiveControl([{ x: 1, y: 0, team: 0 }], center, 3)).toEqual({
      owner: "blue",
      contested: false,
      blueCount: 1,
      redCount: 0,
    });
  });

  it("marks the zone contested when both teams are present", () => {
    const value = resolveObjectiveControl(
      [
        { x: 1, y: 0, team: 0 },
        { x: -1, y: 0, team: 1 },
      ],
      center,
      3,
    );
    expect(value.owner).toBe("none");
    expect(value.contested).toBe(true);
  });

  it("ignores players outside the objective radius", () => {
    expect(resolveObjectiveControl([{ x: 4, y: 0, team: 1 }], center, 3).owner).toBe("none");
  });
});
