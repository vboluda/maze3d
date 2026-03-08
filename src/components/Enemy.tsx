import type { PlanePosition } from "./Box";

export type EnemyBehavior = "chase" | "patrol" | "wander";

export type EnemyProps = {
  id: string;
  behavior: EnemyBehavior;
  position: PlanePosition & {
    z?: number;
  };
  size?: number;
  height?: number;
  radius?: number;
  speed?: number;
  patrolAxis?: "x" | "y";
  patrolDirection?: 1 | -1;
  decisionInterval?: number;
  retargetInterval?: number;
};

export default function Enemy(_props: EnemyProps) {
  return null;
}