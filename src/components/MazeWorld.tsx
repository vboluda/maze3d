import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import Box, { type BoxProps, type PlanePosition } from "./Box";

type MazeWorldProps = {
  worldSize: number;
  startPosition: PlanePosition;
  extrernalWall?: number;
  lightIntensity?: {
    hemisphere?: number;
    directional?: number;
  };
  children?: ReactNode;
};

type BoxDefinition = Required<Pick<BoxProps, "size" | "color">> & {
  position: Required<BoxProps["position"]>;
};

const toWorldX = (worldSize: number, x: number) => -worldSize / 2 + x;
const toWorldZ = (worldSize: number, y: number) => worldSize / 2 - y;
const toTileCenterWorldX = (worldSize: number, x: number) => toWorldX(worldSize, x + 0.5);
const toTileCenterWorldZ = (worldSize: number, y: number) => toWorldZ(worldSize, y + 0.5);
const toBoxWorldX = (worldSize: number, x: number) => toWorldX(worldSize, x + 0.5);
const toBoxWorldZ = (worldSize: number, y: number) => toWorldZ(worldSize, y + 0.5);
const WALL_TEXTURE_PATH = "/Bricks038_2K-JPG_Color.jpg";

const isBoxElement = (
  child: ReactNode
): child is ReactElement<BoxProps, typeof Box> =>
  isValidElement(child) && child.type === Box;

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

export default function MazeWorld({
  worldSize,
  startPosition,
  extrernalWall = 0,
  lightIntensity,
  children,
}: MazeWorldProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const boxes = useMemo<BoxDefinition[]>(() => {
    const childBoxes = Children.toArray(children)
      .filter(isBoxElement)
      .map((child) => ({
        position: {
          x: child.props.position.x,
          y: child.props.position.y,
          z: child.props.position.z ?? 0,
        },
        size: child.props.size ?? 1,
        color: child.props.color ?? 0x8b1e3f,
      }));

    return [...createExternalWallBoxes(worldSize, extrernalWall), ...childBoxes];
  }, [children, extrernalWall, worldSize]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x20242b);
    const textureLoader = new THREE.TextureLoader();
    const wallTexture = textureLoader.load(WALL_TEXTURE_PATH);
    wallTexture.colorSpace = THREE.SRGBColorSpace;
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;

    const createRepeatedTexture = ({
      repeatX,
      repeatY,
      offsetX,
      offsetY,
    }: {
      repeatX: number;
      repeatY: number;
      offsetX: number;
      offsetY: number;
    }) => {
      const texture = wallTexture.clone();
      texture.needsUpdate = true;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(repeatX, repeatY);
      texture.offset.set(offsetX, offsetY);
      return texture;
    };

    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    wallTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const halfWorld = worldSize / 2;
    const eyeHeight = 0.5;
    const playerHeight = eyeHeight;
    const moveSpeed = 5;
    const turnSpeed = 2.2;
    const borderPadding = 0.35;
    const playerRadius = 0.25;
    const hemisphereLightIntensity = lightIntensity?.hemisphere ?? 1.0;
    const directionalLightIntensity = lightIntensity?.directional ?? 0.55;
    const min = -halfWorld + borderPadding;
    const max = halfWorld - borderPadding;
    const startX = toTileCenterWorldX(worldSize, startPosition.x);
    const startZ = toTileCenterWorldZ(worldSize, startPosition.y);

    const groundGeometry = new THREE.PlaneGeometry(
      worldSize,
      worldSize,
      worldSize,
      worldSize
    );
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x5b616b,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const grid = new THREE.GridHelper(worldSize, worldSize, 0xb8c0cc, 0x7a8594);
    grid.position.y = 0.01;
    scene.add(grid);

    const hemiLight = new THREE.HemisphereLight(
      0xffffff,
      0x444444,
      hemisphereLightIntensity
    );
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(
      0xffffff,
      directionalLightIntensity
    );
    dirLight.position.set(10, 20, 8);
    scene.add(dirLight);

    const wallMeshes = boxes.map((box) => {
      const geometry = new THREE.BoxGeometry(box.size, box.size, box.size);
      const worldX = toBoxWorldX(worldSize, box.position.x);
      const worldZ = toBoxWorldZ(worldSize, box.position.y);
      const halfSize = box.size / 2;
      const minWorldX = worldX - halfSize + halfWorld;
      const minWorldZ = halfWorld - (worldZ + halfSize);

      const textureRight = createRepeatedTexture({
        repeatX: box.size,
        repeatY: box.size,
        offsetX: minWorldZ,
        offsetY: box.position.z,
      });
      const textureLeft = createRepeatedTexture({
        repeatX: box.size,
        repeatY: box.size,
        offsetX: minWorldZ,
        offsetY: box.position.z,
      });
      const textureFront = createRepeatedTexture({
        repeatX: box.size,
        repeatY: box.size,
        offsetX: minWorldX,
        offsetY: box.position.z,
      });
      const textureBack = createRepeatedTexture({
        repeatX: box.size,
        repeatY: box.size,
        offsetX: minWorldX,
        offsetY: box.position.z,
      });

      const material = [
        new THREE.MeshStandardMaterial({
          map: textureRight,
          color: 0xffffff,
          roughness: 0.9,
          metalness: 0.02,
        }),
        new THREE.MeshStandardMaterial({
          map: textureLeft,
          color: 0xffffff,
          roughness: 0.9,
          metalness: 0.02,
        }),
        new THREE.MeshStandardMaterial({
          color: box.color,
          roughness: 1,
          metalness: 0,
        }),
        new THREE.MeshStandardMaterial({
          color: box.color,
          roughness: 1,
          metalness: 0,
        }),
        new THREE.MeshStandardMaterial({
          map: textureFront,
          color: 0xffffff,
          roughness: 0.9,
          metalness: 0.02,
        }),
        new THREE.MeshStandardMaterial({
          map: textureBack,
          color: 0xffffff,
          roughness: 0.9,
          metalness: 0.02,
        }),
      ];
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(
        worldX,
        box.position.z + box.size / 2,
        worldZ
      );

      scene.add(mesh);

      return {
        mesh,
        size: box.size,
        textures: [textureRight, textureLeft, textureFront, textureBack],
      };
    });

    const collidesWithWall = (x: number, z: number) => {
      return wallMeshes.some(({ mesh, size }) => {
        const halfSize = size / 2;
        const wallMinX = mesh.position.x - halfSize - playerRadius;
        const wallMaxX = mesh.position.x + halfSize + playerRadius;
        const wallMinZ = mesh.position.z - halfSize - playerRadius;
        const wallMaxZ = mesh.position.z + halfSize + playerRadius;
        const wallBottomY = mesh.position.y - halfSize;
        const wallTopY = mesh.position.y + halfSize;
        const overlapsPlayerHeight = wallBottomY < playerHeight && wallTopY > 0;

        return (
          overlapsPlayerHeight &&
          x >= wallMinX &&
          x <= wallMaxX &&
          z >= wallMinZ &&
          z <= wallMaxZ
        );
      });
    };

    const player = {
      x: Math.max(min, Math.min(max, startX)),
      z: Math.max(min, Math.min(max, startZ)),
      yaw: 0,
    };

    camera.position.set(player.x, eyeHeight, player.z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = player.yaw;

    const pressed = new Set<string>();

    const clamp = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(max, value));

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["w", "a", "s", "d", "q", "e"].includes(key)) {
        pressed.add(key);
        event.preventDefault();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      pressed.delete(event.key.toLowerCase());
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const clock = new THREE.Clock();
    let animationId = 0;

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const movement = new THREE.Vector3();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      if (pressed.has("q")) player.yaw += turnSpeed * dt;
      if (pressed.has("e")) player.yaw -= turnSpeed * dt;

      forward.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
      right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw));

      movement.set(0, 0, 0);

      if (pressed.has("w")) movement.add(forward);
      if (pressed.has("s")) movement.sub(forward);
      if (pressed.has("d")) movement.add(right);
      if (pressed.has("a")) movement.sub(right);

      if (movement.lengthSq() > 0) {
        movement.normalize().multiplyScalar(moveSpeed * dt);

        const nextX = clamp(player.x + movement.x, min, max);
        if (!collidesWithWall(nextX, player.z)) {
          player.x = nextX;
        }

        const nextZ = clamp(player.z + movement.z, min, max);
        if (!collidesWithWall(player.x, nextZ)) {
          player.z = nextZ;
        }
      }

      player.x = clamp(player.x, min, max);
      player.z = clamp(player.z, min, max);

      camera.position.set(player.x, eyeHeight, player.z);
      camera.rotation.y = player.yaw;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);

      grid.geometry.dispose();
      if (Array.isArray(grid.material)) {
        grid.material.forEach((material: THREE.Material) => material.dispose());
      } else {
        grid.material.dispose();
      }

      groundGeometry.dispose();
      groundMaterial.dispose();
      wallMeshes.forEach(({ mesh, textures }) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material: THREE.Material) => material.dispose());
        }
        textures.forEach((texture) => texture.dispose());
      });
      wallTexture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [
    boxes,
    lightIntensity?.directional,
    lightIntensity?.hemisphere,
    startPosition.x,
    startPosition.y,
    extrernalWall,
    worldSize,
  ]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      <div
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          background: "rgba(0,0,0,0.45)",
          color: "white",
          padding: "12px 14px",
          borderRadius: 12,
          fontFamily: "sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        <div><strong>Controls</strong></div>
        <div>W/S: move forward / backward</div>
        <div>A/D: left / right</div>
        <div>Q/E: turn left / right</div>
      </div>
    </div>
  );
}