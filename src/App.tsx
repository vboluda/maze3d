import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x20242b);

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

    // World
    const WORLD_SIZE = 32;
    const HALF_WORLD = WORLD_SIZE / 2;
    const EYE_HEIGHT = 0.5;
    const MOVE_SPEED = 5;
    const TURN_SPEED = 2.2;
    const BORDER_PADDING = 0.35;

    // 32x32 plane
    const groundGeometry = new THREE.PlaneGeometry(
      WORLD_SIZE,
      WORLD_SIZE,
      WORLD_SIZE,
      WORLD_SIZE
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

    // Visible grid
    const grid = new THREE.GridHelper(WORLD_SIZE, WORLD_SIZE, 0xb8c0cc, 0x7a8594);
    grid.position.y = 0.01;
    scene.add(grid);

    // Medium ambient lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.55);
    dirLight.position.set(10, 20, 8);
    scene.add(dirLight);

    // Player state
    const player = {
      x: 0,
      z: 8,
      yaw: 0,
    };

    camera.position.set(player.x, EYE_HEIGHT, player.z);
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

      // Rotation
      if (pressed.has("q")) player.yaw += TURN_SPEED * dt;
      if (pressed.has("e")) player.yaw -= TURN_SPEED * dt;

      // Player local vectors
      forward.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
      right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw));

      movement.set(0, 0, 0);

      // Movement
      if (pressed.has("w")) movement.add(forward);
      if (pressed.has("s")) movement.sub(forward);
      if (pressed.has("d")) movement.add(right);
      if (pressed.has("a")) movement.sub(right);

      if (movement.lengthSq() > 0) {
        movement.normalize().multiplyScalar(MOVE_SPEED * dt);
        player.x += movement.x;
        player.z += movement.z;
      }

      // Clamp to the 32x32 plane
      const min = -HALF_WORLD + BORDER_PADDING;
      const max = HALF_WORLD - BORDER_PADDING;
      player.x = clamp(player.x, min, max);
      player.z = clamp(player.z, min, max);

      // Apply to camera
      camera.position.set(player.x, EYE_HEIGHT, player.z);
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

      groundGeometry.dispose();
      groundMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

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