import MazeWorld from "./components/MazeWorld";
import Box from "./components/Box";

export default function App() {
  return (
    <MazeWorld
      worldSize={32}
      startPosition={{ x: 1, y: 1 }}
      lightIntensity={{ hemisphere: 0.5, directional: 0.5 }}
      extrernalWall={1}
    >
      <Box position={{ x: 10, y: 0 }} />
      <Box position={{ x: 10, y: 1 }} />
      <Box position={{ x: 10, y: 2 }} />
      <Box position={{ x: 10, y: 3 }} />
      <Box position={{ x: 10, y: 3, z: 1 }} />

      <Box position={{ x: 13, y: 13 }} />
      <Box position={{ x: 13, y: 14 }} />
      <Box position={{ x: 13, y: 15 }} />
      <Box position={{ x: 13, y: 16 }} />
      <Box position={{ x: 13, y: 17 }} />
      <Box position={{ x: 13, y: 18 }} />
      <Box position={{ x: 15, y: 13 }} />
      <Box position={{ x: 15, y: 14 }} />
      <Box position={{ x: 15, y: 15 }} />
      <Box position={{ x: 15, y: 16 }} />
      <Box position={{ x: 15, y: 17 }} />
      <Box position={{ x: 15, y: 18 }} />
      <Box position={{ x: 13, y: 13,z:1 }} />
      <Box position={{ x: 13, y: 14, z: 1 }} />
      <Box position={{ x: 13, y: 15, z: 1 }} />
      <Box position={{ x: 13, y: 16, z: 1 }} />
      <Box position={{ x: 13, y: 17, z: 1 }} />
      <Box position={{ x: 13, y: 18, z: 1 }} />
      <Box position={{ x: 15, y: 13, z: 1 }} />
      <Box position={{ x: 15, y: 14, z: 1 }} />
      <Box position={{ x: 15, y: 15, z: 1 }} />
      <Box position={{ x: 15, y: 16, z: 1 }} />
      <Box position={{ x: 15, y: 17, z: 1 }} />
      <Box position={{ x: 15, y: 18, z: 1 }} />
      <Box position={{ x: 14, y: 13, z: 1 }} />a
      <Box position={{ x: 14, y: 14, z: 1 }} />
      <Box position={{ x: 14, y: 15, z: 1 }} />
      <Box position={{ x: 14, y: 16, z: 1 }} />
      <Box position={{ x: 14, y: 17, z: 1 }} />
      <Box position={{ x: 14, y: 18, z: 1 }} />
    </MazeWorld>
  );
}