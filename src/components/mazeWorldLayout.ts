import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import Box, { type BoxProps } from "./Box";
import WallH, { type WallHProps } from "./WallH";
import WallV, { type WallVProps } from "./WallV";
import type { BoxDefinition } from "./mazeWorldTypes";

const isBoxElement = (
  child: ReactNode
): child is ReactElement<BoxProps, typeof Box> =>
  isValidElement(child) && child.type === Box;

const isWallHElement = (
  child: ReactNode
): child is ReactElement<WallHProps, typeof WallH> =>
  isValidElement(child) && child.type === WallH;

const isWallVElement = (
  child: ReactNode
): child is ReactElement<WallVProps, typeof WallV> =>
  isValidElement(child) && child.type === WallV;

const createBoxDefinition = (
  position: Required<BoxProps["position"]>,
  size = 1,
  color = 0x8b1e3f
): BoxDefinition => ({
  position,
  size,
  color,
});

const createExternalWallBoxes = (
  worldSize: number,
  extrernalWall: number
): BoxDefinition[] => {
  const wallHeight = Math.max(0, Math.floor(extrernalWall));

  if (wallHeight === 0) {
    return [];
  }

  const wallBoxes: BoxDefinition[] = [];

  for (let z = 0; z < wallHeight; z += 1) {
    for (let x = 0; x < worldSize; x += 1) {
      wallBoxes.push({
        position: { x, y: 0, z },
        size: 1,
        color: 0x8b1e3f,
      });

      if (worldSize > 1) {
        wallBoxes.push({
          position: { x, y: worldSize - 1, z },
          size: 1,
          color: 0x8b1e3f,
        });
      }
    }

    for (let y = 1; y < worldSize - 1; y += 1) {
      wallBoxes.push({
        position: { x: 0, y, z },
        size: 1,
        color: 0x8b1e3f,
      });

      if (worldSize > 1) {
        wallBoxes.push({
          position: { x: worldSize - 1, y, z },
          size: 1,
          color: 0x8b1e3f,
        });
      }
    }
  }

  return wallBoxes;
};

export const buildWorldBoxes = (
  children: ReactNode,
  worldSize: number,
  extrernalWall: number
): BoxDefinition[] => {
  const childBoxes = Children.toArray(children).flatMap((child) => {
    if (isBoxElement(child)) {
      return [
        createBoxDefinition(
          {
            x: child.props.position.x,
            y: child.props.position.y,
            z: child.props.position.z ?? 0,
          },
          child.props.size ?? 1,
          child.props.color ?? 0x8b1e3f
        ),
      ];
    }

    if (isWallHElement(child)) {
      const wallLength = Math.max(0, Math.floor(child.props.length));
      const z = child.props.posz ?? 0;
      const size = child.props.size ?? 1;
      const color = child.props.color ?? 0x8b1e3f;

      return Array.from({ length: wallLength }, (_, index) =>
        createBoxDefinition(
          {
            x: child.props.posx + index,
            y: child.props.posy,
            z,
          },
          size,
          color
        )
      );
    }

    if (isWallVElement(child)) {
      const wallLength = Math.max(0, Math.floor(child.props.length));
      const z = child.props.posz ?? 0;
      const size = child.props.size ?? 1;
      const color = child.props.color ?? 0x8b1e3f;

      return Array.from({ length: wallLength }, (_, index) =>
        createBoxDefinition(
          {
            x: child.props.posx,
            y: child.props.posy + index,
            z,
          },
          size,
          color
        )
      );
    }

    return [];
  });

  return [...createExternalWallBoxes(worldSize, extrernalWall), ...childBoxes];
};