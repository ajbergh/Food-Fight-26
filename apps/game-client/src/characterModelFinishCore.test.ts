import { describe, expect, it } from "vitest";
import {
  findNamedAttachment,
  resolveChefModelFinish,
  type NamedNodeLike,
} from "./characterModelFinishCore";

interface TestNode extends NamedNodeLike<TestNode> {
  name: string;
  children: TestNode[];
}

describe("character model finish", () => {
  it("selects deterministic bounded chef variants", () => {
    const first = resolveChefModelFinish("player-alpha");
    const repeated = resolveChefModelFinish("player-alpha");
    expect(repeated).toEqual(first);
    expect(first.toqueHeight).toBeGreaterThanOrEqual(0.86);
    expect(first.toqueHeight).toBeLessThanOrEqual(1.14);
    expect(first.toqueWidth).toBeGreaterThanOrEqual(0.94);
    expect(first.toqueWidth).toBeLessThanOrEqual(1.08);
    expect(first.apronWidth).toBeGreaterThanOrEqual(0.96);
    expect(first.apronWidth).toBeLessThanOrEqual(1.06);
  });

  it("prefers exact attachment names before partial matches", () => {
    const partial: TestNode = { name: "DEF-head_end", children: [] };
    const exact: TestNode = { name: "Head", children: [] };
    const root: TestNode = {
      name: "root",
      children: [partial, { name: "rig", children: [exact] }],
    };

    expect(findNamedAttachment(root, ["head"])).toBe(exact);
  });

  it("falls back to partial skeletal names", () => {
    const spine: TestNode = { name: "DEF-spine.006", children: [] };
    const root: TestNode = { name: "root", children: [spine] };
    expect(findNamedAttachment(root, ["upperchest", "spine.006"])).toBe(spine);
  });
});
