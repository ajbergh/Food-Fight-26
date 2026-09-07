export interface RenderResourceSample {
  drawCallsTotal: number;
  triangles: number | null;
  skinnedDrawCalls: number | null;
  vramTextureBytes: number;
  vramGeometryBytes: number;
  vramBufferBytes: number;
  vramTotalBytes: number;
}

export interface RenderResourceSummary {
  sampleCount: number;
  drawCallsP50: number;
  drawCallsP95: number;
  drawCallsMax: number;
  trianglesP50: number | null;
  trianglesP95: number | null;
  trianglesMax: number | null;
  skinnedDrawCallsP50: number | null;
  skinnedDrawCallsP95: number | null;
  skinnedDrawCallsMax: number | null;
  vramTextureBytesMax: number;
  vramGeometryBytesMax: number;
  vramBufferBytesMax: number;
  vramTotalBytesMax: number;
}

export function summarizeRenderResourceSamples(
  samples: readonly RenderResourceSample[],
): RenderResourceSummary {
  const drawCalls = samples.map((sample) => sample.drawCallsTotal);
  const triangles = samples.flatMap((sample) => sample.triangles === null ? [] : [sample.triangles]);
  const skinned = samples.flatMap((sample) => sample.skinnedDrawCalls === null ? [] : [sample.skinnedDrawCalls]);

  return {
    sampleCount: samples.length,
    drawCallsP50: percentile(drawCalls, 0.5),
    drawCallsP95: percentile(drawCalls, 0.95),
    drawCallsMax: max(drawCalls),
    trianglesP50: nullablePercentile(triangles, 0.5),
    trianglesP95: nullablePercentile(triangles, 0.95),
    trianglesMax: nullableMax(triangles),
    skinnedDrawCallsP50: nullablePercentile(skinned, 0.5),
    skinnedDrawCallsP95: nullablePercentile(skinned, 0.95),
    skinnedDrawCallsMax: nullableMax(skinned),
    vramTextureBytesMax: max(samples.map((sample) => sample.vramTextureBytes)),
    vramGeometryBytesMax: max(samples.map((sample) => sample.vramGeometryBytes)),
    vramBufferBytesMax: max(samples.map((sample) => sample.vramBufferBytes)),
    vramTotalBytesMax: max(samples.map((sample) => sample.vramTotalBytes)),
  };
}

function percentile(values: readonly number[], fraction: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(fraction * sorted.length) - 1));
  return sorted[index]!;
}

function nullablePercentile(values: readonly number[], fraction: number) {
  return values.length === 0 ? null : percentile(values, fraction);
}

function max(values: readonly number[]) {
  return values.length === 0 ? 0 : Math.max(...values);
}

function nullableMax(values: readonly number[]) {
  return values.length === 0 ? null : max(values);
}
