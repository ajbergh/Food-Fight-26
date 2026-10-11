import { describe, expect, it } from "vitest";
import { TelemetryIngressLimiter } from "./telemetryIngressLimiter";

describe("public telemetry ingestion limits", () => {
  it("keeps malformed/flooding clients below the global cap even behind one proxy", () => {
    const limit = new TelemetryIngressLimiter(3, 2, 5);
    expect(limit.acceptRequest(100)).toBe(true);
    expect(limit.acceptRequest(101)).toBe(true);
    expect(limit.acceptRequest(102)).toBe(true);
    expect(limit.acceptRequest(103)).toBe(false);
    expect(limit.acceptRequest(60100)).toBe(true);
  });
  it("enforces independent session ceilings and rolls over the window", () => {
    const limit = new TelemetryIngressLimiter(100, 2, 5);
    expect(limit.acceptSession("a",100)).toBe(true);
    expect(limit.acceptSession("a",101)).toBe(true);
    expect(limit.acceptSession("a",102)).toBe(false);
    expect(limit.acceptSession("b",102)).toBe(true);
    expect(limit.acceptSession("a",60100)).toBe(true);
  });
  it("bounds memory by refusing to track unlimited simultaneous session IDs", () => {
    const limit = new TelemetryIngressLimiter(100, 3, 2);
    expect(limit.acceptSession("a", 100)).toBe(true);
    expect(limit.acceptSession("b", 100)).toBe(true);
    expect(limit.acceptSession("c", 200)).toBe(false);
    expect(limit.acceptSession("c", 60100)).toBe(true);
  });
});
