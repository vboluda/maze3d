export const toWorldX = (worldSize: number, x: number) => -worldSize / 2 + x;

export const toWorldZ = (worldSize: number, y: number) => worldSize / 2 - y;

export const toTileCenterWorldX = (worldSize: number, x: number) =>
  toWorldX(worldSize, x + 0.5);

export const toTileCenterWorldZ = (worldSize: number, y: number) =>
  toWorldZ(worldSize, y + 0.5);

export const toBoxWorldX = (worldSize: number, x: number) =>
  toWorldX(worldSize, x + 0.5);

export const toBoxWorldZ = (worldSize: number, y: number) =>
  toWorldZ(worldSize, y + 0.5);

export const toTileX = (worldSize: number, worldX: number) =>
  Math.floor(worldX + worldSize / 2);

export const toTileY = (worldSize: number, worldZ: number) =>
  Math.floor(worldSize / 2 - worldZ);

export const isNear = (value: number, target: number, epsilon = 0.08) =>
  Math.abs(value - target) <= epsilon;

export const manhattanDistance = (
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
) => Math.abs(toX - fromX) + Math.abs(toY - fromY);

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const getWorldBounds = (worldSize: number, borderPadding: number) => {
  const halfWorld = worldSize / 2;

  return {
    halfWorld,
    min: -halfWorld + borderPadding,
    max: halfWorld - borderPadding,
  };
};