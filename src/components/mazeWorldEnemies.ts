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

const direction = (x: -1 | 0 | 1, y: -1 | 0 | 1): GridDirection => ({ x, y });

const isAtTileCenter = (enemy: EnemyEntity, worldSize: number) => {
  const centerX = toTileCenterWorldX(worldSize, toTileX(worldSize, enemy.x));
  const centerZ = toTileCenterWorldZ(worldSize, toTileY(worldSize, enemy.z));

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
  tileX,
  tileY,
  worldSize,
  collisionSystem,
}: {
  enemy: EnemyEntity;
  tileX: number;
  tileY: number;
  worldSize: number;
  collisionSystem: CollisionSystem;
}) => {
  const x = toTileCenterWorldX(worldSize, tileX);
  const z = toTileCenterWorldZ(worldSize, tileY);

  return !collisionSystem.collidesWithWalls({
    x,
    z,
    radius: enemy.radius,
    height: enemy.height,
  });
};

const getAvailableDirections = ({
  enemy,
  tileX,
  tileY,
  worldSize,
  collisionSystem,
}: {
  enemy: EnemyEntity;
  tileX: number;
  tileY: number;
  worldSize: number;
  collisionSystem: CollisionSystem;
}) =>
  CARDINAL_DIRECTIONS.filter((direction) =>
    canOccupyTile({
      enemy,
      tileX: tileX + direction.x,
      tileY: tileY + direction.y,
      worldSize,
      collisionSystem,
    })
  );

const choosePatrolDirection = (
  enemy: EnemyEntity,
  tileX: number,
  tileY: number,
  worldSize: number,
  collisionSystem: CollisionSystem
) => {
  const forward = enemy.patrolAxis === "x"
    ? direction(enemy.patrolDirection, 0)
    : direction(0, enemy.patrolDirection);

  if (
    canOccupyTile({
      enemy,
      tileX: tileX + forward.x,
      tileY: tileY + forward.y,
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
  tileX: number,
  tileY: number,
  worldSize: number,
  collisionSystem: CollisionSystem
) => {
  const playerTileX = toTileX(worldSize, player.x);
  const playerTileY = toTileY(worldSize, player.z);
  const availableDirections = getAvailableDirections({
    enemy,
    tileX,
    tileY,
    worldSize,
    collisionSystem,
  });

  const candidates = availableDirections.filter(
    (direction) => !isReverseDirection(direction, enemy.direction)
  );
  const pool = candidates.length > 0 ? candidates : availableDirections;

  return pool.reduce<GridDirection>((bestDirection, direction) => {
    const bestDistance = manhattanDistance(
      tileX + bestDirection.x,
      tileY + bestDirection.y,
      playerTileX,
      playerTileY
    );
    const nextDistance = manhattanDistance(
      tileX + direction.x,
      tileY + direction.y,
      playerTileX,
      playerTileY
    );

    return nextDistance < bestDistance ? direction : bestDirection;
  }, pool[0] ?? enemy.direction);
};

const chooseWanderDirection = (
  enemy: EnemyEntity,
  tileX: number,
  tileY: number,
  worldSize: number,
  collisionSystem: CollisionSystem
) => {
  const availableDirections = getAvailableDirections({
    enemy,
    tileX,
    tileY,
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
}: {
  enemy: EnemyEntity;
  player: PlayerEntity;
  worldSize: number;
  collisionSystem: CollisionSystem;
}) => {
  const tileX = toTileX(worldSize, enemy.x);
  const tileY = toTileY(worldSize, enemy.z);

  if (enemy.behavior === "patrol") {
    return choosePatrolDirection(enemy, tileX, tileY, worldSize, collisionSystem);
  }

  if (enemy.behavior === "chase") {
    return chooseChaseDirection(enemy, player, tileX, tileY, worldSize, collisionSystem);
  }

  return chooseWanderDirection(enemy, tileX, tileY, worldSize, collisionSystem);
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

const moveEnemy = ({
  enemy,
  dt,
  bounds,
  collisionSystem,
}: {
  enemy: EnemyEntity;
  dt: number;
  bounds: WorldBounds;
  collisionSystem: CollisionSystem;
}) => {
  const stepX = enemy.direction.x * enemy.speed * dt;
  const stepZ = -enemy.direction.y * enemy.speed * dt;

  let blocked = false;

  if (stepX !== 0) {
    const nextX = enemy.x + stepX;

    if (
      !collisionSystem.collidesWithWalls({
        x: nextX,
        z: enemy.z,
        radius: enemy.radius,
        height: enemy.height,
      })
    ) {
      enemy.x = nextX;
    } else {
      blocked = true;
    }
  }

  if (stepZ !== 0) {
    const nextZ = enemy.z + stepZ;

    if (
      !collisionSystem.collidesWithWalls({
        x: enemy.x,
        z: nextZ,
        radius: enemy.radius,
        height: enemy.height,
      })
    ) {
      enemy.z = nextZ;
    } else {
      blocked = true;
    }
  }

  clampEntityToBounds(enemy, bounds);

  return blocked;
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
  return enemies.some((enemy) => {
    enemy.nextDecisionIn -= dt;

    if (shouldReevaluateDirection(enemy, worldSize, false)) {
      enemy.direction = chooseEnemyDirection({
        enemy,
        player,
        worldSize,
        collisionSystem,
      });
      enemy.nextDecisionIn =
        enemy.behavior === "chase" ? enemy.retargetInterval : enemy.decisionInterval;
    }

    const blocked = moveEnemy({
      enemy,
      dt,
      bounds,
      collisionSystem,
    });

    if (blocked) {
      enemy.direction = chooseEnemyDirection({
        enemy,
        player,
        worldSize,
        collisionSystem,
      });
      enemy.nextDecisionIn = 0;
    }

    if (!isZeroDirection(enemy.direction)) {
      enemy.yaw = Math.atan2(-enemy.direction.x, enemy.direction.y);
    }

    return collisionSystem.collidesEntityWithPlayer({
      entityX: enemy.x,
      entityZ: enemy.z,
      entityRadius: enemy.radius,
      playerX: player.x,
      playerZ: player.z,
      playerRadius: player.radius,
    });
  });
};