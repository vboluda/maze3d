export type PlanePosition = {
  x: number;
  y: number;
};

export type BoxProps = {
  position: PlanePosition & {
    z?: number;
  };
  size?: number;
  color?: number;
};

export default function Box(_props: BoxProps) {
  return null;
}