export interface PlayerInputMessage {
  seq: number;
  moveX: number;
  moveY: number;
  aimX: number;
  aimY: number;
  throwPressed: boolean;
  bananaPressed: boolean;
  dodgePressed: boolean;
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
  dodgeRemaining: number;
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

export interface BananaSnapshot {
  x: number;
  y: number;
  team: number;
  ownerSessionId: string;
  lifetime: number;
  kind: "banana";
}

export interface ImpactMessage {
  x: number;
  y: number;
  kind: "tomato" | "banana";
  targetSessionId?: string;
}

export interface MatchStateShape {
  players: Record<string, PlayerSnapshot>;
  projectiles: Record<string, ProjectileSnapshot>;
  bananas: Record<string, BananaSnapshot>;
  blueScore: number;
  redScore: number;
  timeRemaining: number;
  phase: "waiting" | "playing" | "finished";
}
