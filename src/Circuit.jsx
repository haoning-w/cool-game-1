import { Clone, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function createAsphaltMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark asphalt base
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, 512, 512);

  // Asphalt grain noise
  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const b = Math.floor(Math.random() * 30);
    const s = Math.random() * 2.5 + 0.5;
    ctx.fillStyle = `rgba(${30 + b},${30 + b},${30 + b},0.6)`;
    ctx.fillRect(x, y, s, s);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 20);
  return tex;
}

function createDashEmissiveMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Black = no emission across the full canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 512);

  // Wide yellow dashes in center (~20% of road width each side of center)
  const dashW = 36;
  const cx = (512 - dashW) / 2;
  const dashLen = 120;
  const gapLen = 100;
  ctx.fillStyle = '#FFFF00';
  for (let y = 0; y < 512; y += dashLen + gapLen) {
    ctx.fillRect(cx, y, dashW, dashLen);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 20);
  return tex;
}

const asphaltTexture = createAsphaltMap();
const dashEmissiveMap = createDashEmissiveMap();

export default function Circuit({performanceMode}) {
  const { scene } = useGLTF(performanceMode ? 'static/circuit-min.glb' : 'static/circuit.glb');
  scene.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        map: asphaltTexture,
        roughness: 0.95,
        metalness: 0,
      });
      child.castShadow = true;
      child.receiveShadow = true;
    }
		if (child.name === 'Terrain') {
			child.material = new THREE.MeshStandardMaterial({
				color: '#f9f9f9',
				roughness: 1,
				metalness: 0
			});
		}
		if (child.name === 'Plane') {
			child.material = new THREE.MeshStandardMaterial({
				color: '#ffffff',
				map: asphaltTexture,
				emissiveMap: dashEmissiveMap,
				emissive: '#ffffff',
				emissiveIntensity: 1.5,
				roughness: 0.95,
				metalness: 0,
			});
		}
  });

  return (
    <>
      <Clone object={scene} position={[0, 0, 0]} />
    </>
  );
}
