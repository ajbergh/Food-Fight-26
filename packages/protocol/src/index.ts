export type MatchPhase = "waiting" | "playing" | "overtime" | "finished";
export type TeamName = "none" | "blue" | "red";

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
  tomatoAmmo: number;
  bananaAmmo: number;
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

export interface PickupSnapshot {
  x: number;
  y: number;
  kind: "tomato" | "banana";
  available: boolean;
  respawnRemaining: number;
}

export interface ImpactMessage {
  x: number;
  y: number;
  kind: "tomato" | "banana";
  targetSessionId?: string;
}

export interface MatchEventMessage {
  type: "round_started" | "objective_control" | "overtime" | "round_finished";
  roundNumber: number;
  team?: "blue" | "red";
  reason?: string;
}

export interface MatchStateShape {
  players: Record<string, PlayerSnapshot>;
  projectiles: Record<string, ProjectileSnapshot>;
  bananas: Record<string, BananaSnapshot>;
  pickups: Record<string, PickupSnapshot>;
  blueScore: number;
  redScore: number;
  timeRemaining: number;
  phase: MatchPhase;
  phaseRemaining: number;
  objectiveOwner: TeamName;
  objectiveContested: boolean;
  winner: TeamName;
  roundNumber: number;
}
