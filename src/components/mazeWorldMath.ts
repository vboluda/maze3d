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