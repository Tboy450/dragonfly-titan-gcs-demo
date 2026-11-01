// Loads modular kit pieces (glTF/GLB) once and keeps each piece's own origin, so walls, corners
// and roofs snap together the way the kit's author laid them out. A piece is a list of parts
// (geometry, material and the part's matrix inside the piece) ready for Batches.piece().
import { THREE } from "./core.mjs?v=dev";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const cache = new Map();
let anisotropy = 4;
let progress = () => {};

export function configureAssets({ renderer, onProgress }) {
  anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  if (onProgress) progress = onProgress;
}

async function loadPiece(url) {
  const gltf = await loader.loadAsync(url);
  const root = gltf.scene;
  root.updateMatrixWorld(true);
  const parts = [];
  const bounds = new THREE.Box3();
  root.traverse((object) => {
    if (!object.isMesh) return;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material.map) material.map.anisotropy = anisotropy;
    }
    parts.push({ geometry: object.geometry, material: object.material, matrix: object.matrixWorld.clone() });
    object.geometry.computeBoundingBox();
    bounds.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
  });
  return { parts, bounds, size: bounds.getSize(new THREE.Vector3()) };
}

// folder: path under ./assets/, names: piece file names without extension.
export async function loadKit(folder, names, extension = "glb") {
  let done = 0;
  const entries = await Promise.all(names.map(async (name) => {
    const url = `./assets/${folder}/${name}.${extension}`;
    if (!cache.has(url)) cache.set(url, loadPiece(url));
    const piece = await cache.get(url);
    done += 1;
    progress(done, names.length);
    return [name, piece];
  }));
  return Object.fromEntries(entries);
}
