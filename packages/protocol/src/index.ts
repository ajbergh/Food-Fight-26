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
}

export interface MatchStateShape {
  players: Record<string, PlayerSnapshot>;
  blueScore: number;
  redScore: number;
  timeRemaining: number;
  phase: "waiting" | "playing" | "finished";
}
