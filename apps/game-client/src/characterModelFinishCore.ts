export type ChefModelVariant = "classic" | "tall-toque" | "compact-toque";

export interface ChefModelFinishProfile {
  variant: ChefModelVariant;
  toqueHeight: number;
  toqueWidth: number;
  apronWidth: number;
}

export interface NamedNodeLike<T extends NamedNodeLike<T>> {
  name: string;
  children: readonly T[];
}

export function resolveChefModelFinish(sessionId: string): ChefModelFinishProfile {
  const variantIndex = hashSession(sessionId) % 3;
  if (variantIndex === 1) {
    return {
      variant: "tall-toque",
      toqueHeight: 1.14,
      toqueWidth: 0.94,
      apronWidth: 0.96,
    };
  }
  if (variantIndex === 2) {
    return {
      variant: "compact-toque",
      toqueHeight: 0.86,
      toqueWidth: 1.08,
      apronWidth: 1.06,
    };
  }
  return {
    variant: "classic",
    toqueHeight: 1,
    toqueWidth: 1,
    apronWidth: 1,
  };
}

export function findNamedAttachment<T extends NamedNodeLike<T>>(
  root: T,
  preferredNames: readonly string[],
): T | null {
  const normalized = preferredNames.map((name) => name.toLowerCase());
  const nodes: T[] = [root];
  const visited: T[] = [];

  while (nodes.length > 0) {
    const node = nodes.shift()!;
    visited.push(node);
    const name = node.name.toLowerCase();
    if (normalized.includes(name)) return node;
    nodes.push(...node.children);
  }

  for (const node of visited) {
    const name = node.name.toLowerCase();
    if (normalized.some((candidate) => name.includes(candidate))) return node;
  }

  return null;
}

function hashSession(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
