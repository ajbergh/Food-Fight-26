/**
 * Bounds unauthenticated browser telemetry before storage. Network/IP routing is
 * not trusted: a global cap protects proxied deployments even when all traffic
 * shares one reverse-proxy address.
 */
export class TelemetryIngressLimiter {
  private windowStartedAt = 0;
  private globalCount = 0;
  private readonly bySession = new Map<string, { since: number; count: number }>();

  constructor(
    private readonly globalPerMinute = 3000,
    private readonly sessionPerMinute = 60,
    private readonly maxSessions = 10000,
  ) {}

  acceptRequest(now: number): boolean {
    if (this.windowStartedAt === 0 || now < this.windowStartedAt || now - this.windowStartedAt >= 60000) {
      this.windowStartedAt = now;
      this.globalCount = 0;
    }
    if (this.globalCount >= this.globalPerMinute) return false;
    this.globalCount += 1;
    return true;
  }

  acceptSession(id: string, now: number): boolean {
    const prior = this.bySession.get(id);
    if (prior && now >= prior.since && now - prior.since < 60000) {
      if (prior.count >= this.sessionPerMinute) return false;
      prior.count += 1;
      return true;
    }
    if (!prior && this.bySession.size >= this.maxSessions) {
      for (const [session, item] of this.bySession) {
        if (now < item.since || now - item.since >= 60000) this.bySession.delete(session);
      }
      if (this.bySession.size >= this.maxSessions) return false;
    }
    this.bySession.set(id, { since: now, count: 1 });
    return true;
  }
}
