import type {
  DynamicGameObject,
} from "./gameRuntimeTypes";
import type { PlayerEntity } from "./mazeWorldEntities";
import { createEnemiesGameObject } from "./enemiesGameObject";
import { createPlayerGameObject } from "./playerGameObject";

type CreateDefaultDynamicGameObjectsParams = {
  player: PlayerEntity;
};

export const createDefaultDynamicGameObjects = ({
  player,
}: CreateDefaultDynamicGameObjectsParams): DynamicGameObject[] => [
  createPlayerGameObject(player),
  createEnemiesGameObject(),
];