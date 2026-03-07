import MazeWorld, { Box } from "./components/MazeWorld";

export default function App() {
  return (
    <MazeWorld worldSize={32} startPosition={{ x: 0, y: 0 }}>
      <Box position={{ x: 10, y: 0 }} />
      <Box position={{ x: 10, y: 1 }} />
      <Box position={{ x: 10, y: 2 }} />
      <Box position={{ x: 10, y: 3 }} />
      <Box position={{ x: 10, y: 3, z: 1 }} />
      <Box position={{ x: 12, y: 10 }} />
    </MazeWorld>
  );
}