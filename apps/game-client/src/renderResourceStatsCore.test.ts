import { describe, expect, it } from "vitest";
import { summarizeRenderResourceSamples } from "./renderResourceStatsCore";

describe("summarizeRenderResourceSamples", () => {
  it("summarizes basic and detailed render samples", () => {
    const summary = summarizeRenderResourceSamples([
      { drawCallsTotal: 10, triangles: 100, skinnedDrawCalls: 2, vramTextureBytes: 10, vramGeometryBytes: 20, vramBufferBytes: 5, vramTotalBytes: 35 },
      { drawCallsTotal: 20, triangles: 300, skinnedDrawCalls: 4, vramTextureBytes: 15, vramGeometryBytes: 25, vramBufferBytes: 6, vramTotalBytes: 46 },
      { drawCallsTotal: 30, triangles: 200, skinnedDrawCalls: 3, vramTextureBytes: 12, vramGeometryBytes: 24, vramBufferBytes: 7, vramTotalBytes: 43 },
    ]);

    expect(summary).toEqual({
      sampleCount: 3,
      drawCallsP50: 20,
      drawCallsP95: 30,
      drawCallsMax: 30,
      trianglesP50: 200,
      trianglesP95: 300,
      trianglesMax: 300,
      skinnedDrawCallsP50: 3,
      skinnedDrawCallsP95: 4,
      skinnedDrawCallsMax: 4,
      vramTextureBytesMax: 15,
      vramGeometryBytesMax: 25,
      vramBufferBytesMax: 7,
      vramTotalBytesMax: 46,
    });
  });

  it("keeps profiler-only values nullable when detailed stats are unavailable", () => {
    const summary = summarizeRenderResourceSamples([
      { drawCallsTotal: 12, triangles: null, skinnedDrawCalls: null, vramTextureBytes: 1, vramGeometryBytes: 2, vramBufferBytes: 3, vramTotalBytes: 6 },
    ]);

    expect(summary.trianglesP50).toBeNull();
    expect(summary.trianglesP95).toBeNull();
    expect(summary.trianglesMax).toBeNull();
    expect(summary.skinnedDrawCallsP50).toBeNull();
    expect(summary.skinnedDrawCallsP95).toBeNull();
    expect(summary.skinnedDrawCallsMax).toBeNull();
  });
});
