import type { WallMeshRecord } from "./mazeWorldTypes";

type CollisionParams = {
  x: number;
  z: number;
  playerRadius: number;
  playerHeight: number;
  wallMeshes: WallMeshRecord[];
};

export const collidesWithWall = ({
  x,
  z,
  playerRadius,
  playerHeight,
  wallMeshes,
}: CollisionParams) => {
  return wallMeshes.some(({ mesh, size }) => {
    const halfSize = size / 2;
    const wallMinX = mesh.position.x - halfSize - playerRadius;
    const wallMaxX = mesh.position.x + halfSize + playerRadius;
    const wallMinZ = mesh.position.z - halfSize - playerRadius;
    const wallMaxZ = mesh.position.z + halfSize + playerRadius;
    const wallBottomY = mesh.position.y - halfSize;
    const wallTopY = mesh.position.y + halfSize;
    const overlapsPlayerHeight = wallBottomY < playerHeight && wallTopY > 0;

    return (
      overlapsPlayerHeight &&
      x >= wallMinX &&
      x <= wallMaxX &&
      z >= wallMinZ &&
      z <= wallMaxZ
    );
  });
};