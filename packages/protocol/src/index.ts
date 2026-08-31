export interface PlayerInputMessage {
  seq: number;
  moveX: number;
  moveY: number;
  aimX: number;
  aimY: number;
  throwPressed: boolean;
}

export interface PlayerSnapshot {
  x: number;
  y: number;
  aimX: number;
  aimY: number;
  team: number;
  displayName: string;
  lastInputSeq: number;
  stunRemaining: number;
}

export interface ProjectileSnapshot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  team: number;
  ownerSessionId: string;
  lifetime: number;
  kind: "tomato";
}

export interface ImpactMessage {
  x: number;
  y: number;
  kind: "tomato";
  targetSessionId?: string;
}

export interface MatchStateShape {
  players: Record<string, PlayerSnapshot>;
  projectiles: Record<string, ProjectileSnapshot>;
  blueScore: number;
  redScore: number;
  timeRemaining: number;
  phase: "waiting" | "playing" | "finished";
}
