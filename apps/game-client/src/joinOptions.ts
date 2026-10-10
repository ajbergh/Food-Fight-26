export interface JoinOptions {
  displayName: string;
  roomId?: string;
  privateRoom: boolean;
}

export function readJoinOptions(query: string, fallbackName: string): JoinOptions {
  const params = new URLSearchParams(query);
  const suppliedName = (params.get("name") ?? "").replace(/[^a-zA-Z0-9 _-]/g, "").trim().slice(0, 20);
  const room = (params.get("room") ?? "").trim();
  const roomId = /^[a-zA-Z0-9_-]{4,80}$/.test(room) ? room : undefined;
  return {
    displayName: suppliedName || fallbackName,
    roomId,
    privateRoom: !roomId && params.get("private") === "1",
  };
}

export function inviteUrl(currentPage: string, roomId: string): string {
  if (!/^[a-zA-Z0-9_-]{4,80}$/.test(roomId)) throw new Error("invalid room ID");
  const url = new URL(currentPage);
  url.search = "";
  url.hash = "";
  url.searchParams.set("room", roomId);
  return url.toString();
}
