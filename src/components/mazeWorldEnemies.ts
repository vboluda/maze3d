import type { CollisionSystem } from "./collisionSystem";
import { clampEntityToBounds } from "./mazeWorldEntities";
import {
  isNear,
  manhattanDistance,
  toTileCenterWorldX,
  toTileCenterWorldZ,
  toTileX,
  toTileY,
} from "./mazeWorldMath";
import type {
  EnemyEntity,
  GridPosition,
  GridDirection,
  WorldBounds,
} from "./mazeWorldTypes";
import type { PlayerEntity } from "./mazeWorldEntities";

const CARDINAL_DIRECTIONS: GridDirection[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

const ENEMY_TILE_EPSILON = 0.09;

type EnemyNavigationContext = {
  enemy: EnemyEntity;
  player: PlayerEntity;
  worldSize: number;
  collisionSystem: CollisionSystem;
};

type EnemyTileNavigationContext = Omit<EnemyNavigationContext, "player"> & {
  tile: GridPosition;
};

type EnemyMovementContext = {
  enemy: EnemyEntity;
  dt: number;
  bounds: WorldBounds;
  collisionSystem: CollisionSystem;
};

const direction = (x: -1 | 0 | 1, y: -1 | 0 | 1): GridDirection => ({ x, y });

const getEnemyTile = (
  enemy: EnemyEntity,
  worldSize: number
): GridPosition => ({
  x: toTileX(worldSize, enemy.x),
  y: toTileY(worldSize, enemy.z),
});

const isAtTileCenter = (enemy: EnemyEntity, worldSize: number) => {
  const tile = getEnemyTile(enemy, worldSize);
  const centerX = toTileCenterWorldX(worldSize, tile.x);
  const centerZ = toTileCenterWorldZ(worldSize, tile.y);

  return (
    isNear(enemy.x, centerX, ENEMY_TILE_EPSILON) &&
    isNear(enemy.z, centerZ, ENEMY_TILE_EPSILON)
  );
};

const isReverseDirection = (a: GridDirection, b: GridDirection) =>
  a.x === -b.x && a.y === -b.y;

const isZeroDirection = (direction: GridDirection) =>
  direction.x === 0 && direction.y === 0;

const canOccupyTile = ({
  enemy,
  tile,
  worldSize,
  collisionSystem,
}: {
  enemy: EnemyEntity;
  tile: GridPosition;
  worldSize: number;
  collisionSystem: CollisionSystem;
}) => {
  const x = toTileCenterWorldX(worldSize, tile.x);
  const z = toTileCenterWorldZ(worldSize, tile.y);

  return !collisionSystem.collidesWithWalls({
    x,
    z,
    radius: enemy.radius,
    height: enemy.height,
  });
};

const getAvailableDirections = ({
  enemy,
  tile,
  worldSize,
  collisionSystem,
}: EnemyTileNavigationContext) =>
  CARDINAL_DIRECTIONS.filter((direction) =>
    canOccupyTile({
      enemy,
      tile: {
        x: tile.x + direction.x,
        y: tile.y + direction.y,
      },
      worldSize,
      collisionSystem,
    })
  );

const choosePatrolDirection = (
  enemy: EnemyEntity,
  tile: GridPosition,
  worldSize: number,
  collisionSystem: CollisionSystem
) => {
  const forward = enemy.patrolAxis === "x"
    ? direction(enemy.patrolDirection, 0)
    : direction(0, enemy.patrolDirection);

  if (
    canOccupyTile({
      enemy,
      tile: {
        x: tile.x + forward.x,
        y: tile.y + forward.y,
      },
      worldSize,
      collisionSystem,
    })
  ) {
    return forward;
  }

  enemy.patrolDirection = enemy.patrolDirection === 1 ? -1 : 1;

  return enemy.patrolAxis === "x"
    ? direction(enemy.patrolDirection, 0)
    : direction(0, enemy.patrolDirection);
};

const chooseChaseDirection = (
  enemy: EnemyEntity,
  player: PlayerEntity,
  tile: GridPosition,
  worldSize: number,
  collisionSystem: CollisionSystem
) => {
  const playerTileX = toTileX(worldSize, player.x);
  const playerTileY = toTileY(worldSize, player.z);
  const availableDirections = getAvailableDirections({
    enemy,
    tile,
    worldSize,
    collisionSystem,
  });

  const candidates = availableDirections.filter(
    (direction) => !isReverseDirection(direction, enemy.direction)
  );
  const pool = candidates.length > 0 ? candidates : availableDirections;

  return pool.reduce<GridDirection>((bestDirection, direction) => {
    const bestDistance = manhattanDistance(
      tile.x + bestDirection.x,
      tile.y + bestDirection.y,
      playerTileX,
      playerTileY
    );
    const nextDistance = manhattanDistance(
      tile.x + direction.x,
      tile.y + direction.y,
      playerTileX,
      playerTileY
    );

    return nextDistance < bestDistance ? direction : bestDirection;
  }, pool[0] ?? enemy.direction);
};

const chooseWanderDirection = (
  enemy: EnemyEntity,
  tile: GridPosition,
  worldSize: number,
  collisionSystem: CollisionSystem
) => {
  const availableDirections = getAvailableDirections({
    enemy,
    tile,
    worldSize,
    collisionSystem,
  });

  if (availableDirections.length === 0) {
    return enemy.direction;
  }

  if (
    !isZeroDirection(enemy.direction) &&
    availableDirections.some(
      (direction) =>
        direction.x === enemy.direction.x && direction.y === enemy.direction.y
    )
  ) {
    return enemy.direction;
  }

  const preferredDirections = availableDirections.filter(
    (direction) => !isReverseDirection(direction, enemy.direction)
  );
  const pool = preferredDirections.length > 0 ? preferredDirections : availableDirections;
  const randomIndex = Math.floor(Math.random() * pool.length);

  return pool[randomIndex];
};

const chooseEnemyDirection = ({
  enemy,
  player,
  worldSize,
  collisionSystem,
}: EnemyNavigationContext) => {
  const tile = getEnemyTile(enemy, worldSize);

  if (enemy.behavior === "patrol") {
    return choosePatrolDirection(enemy, tile, worldSize, collisionSystem);
  }

  if (enemy.behavior === "chase") {
    return chooseChaseDirection(enemy, player, tile, worldSize, collisionSystem);
  }

  return chooseWanderDirection(enemy, tile, worldSize, collisionSystem);
};

const shouldReevaluateDirection = (
  enemy: EnemyEntity,
  worldSize: number,
  forced: boolean
) => {
  if (forced) {
    return true;
  }

  if (!isAtTileCenter(enemy, worldSize)) {
    return false;
  }

  if (enemy.behavior === "patrol") {
    return true;
  }

  return enemy.nextDecisionIn <= 0;
};

const resetEnemyDecisionTimer = (enemy: EnemyEntity) => {
  enemy.nextDecisionIn =
    enemy.behavior === "chase" ? enemy.retargetInterval : enemy.decisionInterval;
};

const tryMoveEnemyAxis = ({
  enemy,
  nextX,
  nextZ,
  collisionSystem,
}: {
  enemy: EnemyEntity;
  nextX: number;
  nextZ: number;
  collisionSystem: CollisionSystem;
}) => {
  if (
    collisionSystem.collidesWithWalls({
      x: nextX,
      z: nextZ,
      radius: enemy.radius,
      height: enemy.height,
    })
  ) {
    return false;
  }

  enemy.x = nextX;
  enemy.z = nextZ;

  return true;
};

const moveEnemy = ({
  enemy,
  dt,
  bounds,
  collisionSystem,
}: EnemyMovementContext) => {
  const stepX = enemy.direction.x * enemy.speed * dt;
  const stepZ = -enemy.direction.y * enemy.speed * dt;

  let blocked = false;

  if (stepX !== 0) {
    if (!tryMoveEnemyAxis({
      enemy,
      nextX: enemy.x + stepX,
      nextZ: enemy.z,
      collisionSystem,
    })) {
      blocked = true;
    }
  }

  if (stepZ !== 0) {
    if (!tryMoveEnemyAxis({
      enemy,
      nextX: enemy.x,
      nextZ: enemy.z + stepZ,
      collisionSystem,
    })) {
      blocked = true;
    }
  }

  clampEntityToBounds(enemy, bounds);

  return blocked;
};

const updateEnemy = (
  enemy: EnemyEntity,
  context: Omit<EnemyNavigationContext, "enemy"> & {
    dt: number;
    bounds: WorldBounds;
  }
) => {
  enemy.nextDecisionIn -= context.dt;

  if (shouldReevaluateDirection(enemy, context.worldSize, false)) {
    enemy.direction = chooseEnemyDirection({
      enemy,
      player: context.player,
      worldSize: context.worldSize,
      collisionSystem: context.collisionSystem,
    });
    resetEnemyDecisionTimer(enemy);
  }

  const blocked = moveEnemy({
    enemy,
    dt: context.dt,
    bounds: context.bounds,
    collisionSystem: context.collisionSystem,
  });

  if (blocked) {
    enemy.direction = chooseEnemyDirection({
      enemy,
      player: context.player,
      worldSize: context.worldSize,
      collisionSystem: context.collisionSystem,
    });
    enemy.nextDecisionIn = 0;
  }

  if (!isZeroDirection(enemy.direction)) {
    enemy.yaw = Math.atan2(-enemy.direction.x, enemy.direction.y);
  }

  return context.collisionSystem.collidesEntityWithPlayer({
    entityX: enemy.x,
    entityZ: enemy.z,
    entityRadius: enemy.radius,
    playerX: context.player.x,
    playerZ: context.player.z,
    playerRadius: context.player.radius,
  });
};

export const updateEnemies = ({
  enemies,
  player,
  dt,
  bounds,
  worldSize,
  collisionSystem,
}: {
  enemies: EnemyEntity[];
  player: PlayerEntity;
  dt: number;
  bounds: WorldBounds;
  worldSize: number;
  collisionSystem: CollisionSystem;
}) => {
  return enemies.some((enemy) =>
    updateEnemy(enemy, {
      player,
      dt,
      bounds,
      worldSize,
      collisionSystem,
    })
  );
};