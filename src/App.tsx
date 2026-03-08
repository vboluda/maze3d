import MazeWorld from "./components/MazeWorld";
import Box from "./components/Box";
import Enemy from "./components/Enemy";
import WallH from "./components/WallH";
import WallV from "./components/WallV";

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
      <WallH posx={3} posy={3} length={8} />
      <WallH posx={3} posy={3} posz={1} length={5} />
      <WallH posx={3} posy={4} posz={1} length={5} />
      <WallH posx={3} posy={5} posz={1} length={5} />
      <WallH posx={3} posy={5} length={5} />

      <WallV posx={9} posy={4} length={7} />
      <WallV posx={9} posy={3} posz={1} length={8} />
      <WallV posx={8} posy={3} posz={1} length={8} />
      <WallV posx={7} posy={6} posz={1} length={5} />
      <WallV posx={7} posy={6} length={5} />

      <WallH posx={1} posy={10} length={6} />

      <WallV posx={9} posy={14} length={7} />
      <WallV posx={9} posy={13} posz={1} length={8} />
      <WallV posx={8} posy={13} posz={1} length={8} />
      <WallV posx={7} posy={16} posz={1} length={5} />
      <WallV posx={7} posy={16} length={5} />

      <Enemy id="enemy-chase-1" behavior="chase" position={{ x: 5, y: 28 }} />
      <Enemy
        id="enemy-patrol-1"
        behavior="patrol"
        position={{ x: 21, y: 18 }}
        patrolAxis="y"
        patrolDirection={1}
        speed={30}
        size={0.01}
      />
       <Enemy
        id="enemy-patrol-2"
        behavior="patrol"
        position={{ x: 2, y: 4 }}
        patrolAxis="x"
        patrolDirection={1}
        speed={1}
        size={0.01}
      />
      <Enemy
        id="enemy-wander-1"
        behavior="wander"
        position={{ x: 26, y: 17 }}
        decisionInterval={1.25}
        speed={5}
      />
      
    </MazeWorld>
  );
}