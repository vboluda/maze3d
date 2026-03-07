import type { ReactNode } from "react";
import type * as THREE from "three";
import type { BoxProps, PlanePosition } from "./Box";

export type MazeWorldLightIntensity = {
  hemisphere?: number;
  directional?: number;
};

export type WorldBounds = {
  halfWorld: number;
  min: number;
  max: number;
};

export type MazeWorldProps = {
  worldSize: number;
  startPosition: PlanePosition;
  extrernalWall?: number;
  lightIntensity?: MazeWorldLightIntensity;
  children?: ReactNode;
};

export type BoxDefinition = Required<Pick<BoxProps, "size" | "color">> & {
  position: Required<BoxProps["position"]>;
};

export type WallMeshRecord = {
  mesh: THREE.Mesh;
  size: number;
  textures: THREE.Texture[];
};