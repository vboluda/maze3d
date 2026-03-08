import * as THREE from "three";
import { toBoxWorldX, toBoxWorldZ } from "./mazeWorldMath";
import type {
  BoxDefinition,
  EnemyBehavior,
  EnemyEntity,
  EnemyVisualSet,
  MazeWorldLightIntensity,
  WallMeshRecord,
} from "./mazeWorldTypes";
import { syncEnemyMeshToEntity } from "./mazeWorldEntities";

const WALL_TEXTURE_PATH = "/Bricks038_2K-JPG_Color.jpg";

export const createScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x20242b);
  return scene;
};

export const createRenderer = (mount: HTMLDivElement) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  mount.appendChild(renderer.domElement);
  return renderer;
};

export const createCamera = (mount: HTMLDivElement) => {
  return new THREE.PerspectiveCamera(
    75,
    mount.clientWidth / mount.clientHeight,
    0.1,
    1000
  );
};

export const createGround = (worldSize: number) => {
  const geometry = new THREE.PlaneGeometry(
    worldSize,
    worldSize,
    worldSize,
    worldSize
  );
  const material = new THREE.MeshStandardMaterial({
    color: 0x5b616b,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;

  return { geometry, material, mesh };
};

export const createGrid = (worldSize: number) => {
  const grid = new THREE.GridHelper(worldSize, worldSize, 0xb8c0cc, 0x7a8594);
  grid.position.y = 0.01;
  return grid;
};

export const createLights = (lightIntensity?: MazeWorldLightIntensity) => {
  const hemisphereLightIntensity = lightIntensity?.hemisphere ?? 1.0;
  const directionalLightIntensity = lightIntensity?.directional ?? 0.55;

  const hemiLight = new THREE.HemisphereLight(
    0xffffff,
    0x444444,
    hemisphereLightIntensity
  );

  const dirLight = new THREE.DirectionalLight(
    0xffffff,
    directionalLightIntensity
  );
  dirLight.position.set(10, 20, 8);

  return { hemiLight, dirLight };
};

export const createWallTexture = (renderer: THREE.WebGLRenderer) => {
  const textureLoader = new THREE.TextureLoader();
  const wallTexture = textureLoader.load(WALL_TEXTURE_PATH);
  wallTexture.colorSpace = THREE.SRGBColorSpace;
  wallTexture.wrapS = THREE.RepeatWrapping;
  wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return wallTexture;
};

const createRepeatedTexture = (
  wallTexture: THREE.Texture,
  repeatX: number,
  repeatY: number,
  offsetX: number,
  offsetY: number
) => {
  const texture = wallTexture.clone();
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.offset.set(offsetX, offsetY);
  return texture;
};

export const createWallMeshes = (
  boxes: BoxDefinition[],
  worldSize: number,
  halfWorld: number,
  scene: THREE.Scene,
  wallTexture: THREE.Texture
): WallMeshRecord[] => {
  return boxes.map((box) => {
    const geometry = new THREE.BoxGeometry(box.size, box.size, box.size);
    const worldX = toBoxWorldX(worldSize, box.position.x);
    const worldZ = toBoxWorldZ(worldSize, box.position.y);
    const halfSize = box.size / 2;
    const minWorldX = worldX - halfSize + halfWorld;
    const minWorldZ = halfWorld - (worldZ + halfSize);

    const textureRight = createRepeatedTexture(
      wallTexture,
      box.size,
      box.size,
      minWorldZ,
      box.position.z
    );
    const textureLeft = createRepeatedTexture(
      wallTexture,
      box.size,
      box.size,
      minWorldZ,
      box.position.z
    );
    const textureFront = createRepeatedTexture(
      wallTexture,
      box.size,
      box.size,
      minWorldX,
      box.position.z
    );
    const textureBack = createRepeatedTexture(
      wallTexture,
      box.size,
      box.size,
      minWorldX,
      box.position.z
    );

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

    mesh.position.set(worldX, box.position.z + box.size / 2, worldZ);
    scene.add(mesh);

    return {
      mesh,
      size: box.size,
      textures: [textureRight, textureLeft, textureFront, textureBack],
    };
  });
};

export const disposeGrid = (grid: THREE.GridHelper) => {
  grid.geometry.dispose();
  if (Array.isArray(grid.material)) {
    grid.material.forEach((material: THREE.Material) => material.dispose());
  } else {
    grid.material.dispose();
  }
};

export const disposeWallMeshes = (wallMeshes: WallMeshRecord[]) => {
  wallMeshes.forEach(({ mesh, textures }) => {
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material: THREE.Material) => material.dispose());
    }
    textures.forEach((texture) => texture.dispose());
  });
};

const ENEMY_COLORS: Record<EnemyBehavior, number> = {
  chase: 0xd9485f,
  patrol: 0xe6a23c,
  wander: 0x4aa3df,
};

export const createEnemyVisuals = (
  enemies: EnemyEntity[],
  scene: THREE.Scene
): EnemyVisualSet => {
  const geometry = new THREE.SphereGeometry(0.5, 16, 12);
  const materials: EnemyVisualSet["materials"] = {
    chase: new THREE.MeshStandardMaterial({
      color: ENEMY_COLORS.chase,
      roughness: 0.85,
      metalness: 0.05,
    }),
    patrol: new THREE.MeshStandardMaterial({
      color: ENEMY_COLORS.patrol,
      roughness: 0.85,
      metalness: 0.05,
    }),
    wander: new THREE.MeshStandardMaterial({
      color: ENEMY_COLORS.wander,
      roughness: 0.85,
      metalness: 0.05,
    }),
  };

  const records = enemies.map((enemy) => {
    const mesh = new THREE.Mesh(geometry, materials[enemy.behavior]);
    syncEnemyMeshToEntity(mesh, enemy);
    scene.add(mesh);

    return {
      enemyId: enemy.id,
      mesh,
    };
  });

  return {
    records,
    geometry,
    materials,
  };
};

export const disposeEnemyVisuals = (
  enemyVisuals: EnemyVisualSet,
  scene: THREE.Scene
) => {
  enemyVisuals.records.forEach(({ mesh }) => {
    scene.remove(mesh);
  });

  enemyVisuals.geometry.dispose();
  Object.values(enemyVisuals.materials).forEach((material) => material.dispose());
};