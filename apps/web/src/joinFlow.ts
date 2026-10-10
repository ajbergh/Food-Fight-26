export type JoinMode = "quick" | "private" | "room";
export function cleanGuestName(value: string): string {
  return value.replace(/[^a-zA-Z0-9 _-]/g, "").trim().slice(0, 20) || "Guest";
}
export function cleanRoomId(value: string): string {
  const id = value.trim();
  return /^[a-zA-Z0-9_-]{4,80}$/.test(id) ? id : "";
}
export function buildPlayUrl(base: string, origin: string, name: string, mode: JoinMode, room = ""): string {
  const url = new URL(base, origin);
  url.searchParams.set("name", cleanGuestName(name));
  url.searchParams.delete("room");
  url.searchParams.delete("private");
  if (mode === "private") url.searchParams.set("private", "1");
  if (mode === "room") {
    const id = cleanRoomId(room);
    if (!id) throw new Error("Enter a valid room code.");
    url.searchParams.set("room", id);
  }
  return url.toString();
}
