import * as THREE from "three";
import type Camera from "~/webgl/scene/Camera";
import type Environment from "~/webgl/scene/Environment";

interface FogControls {
  updateFogColor: (color: THREE.Color) => void;
  updateFogDistance: (min: number, max: number) => void;
  updateFogDensity: (density: number) => void;
}

export const useWorld = defineStore("useWorld", () => {
  const globalScene = ref<THREE.Scene>();
  const scene3d = ref<THREE.Group | null>(null);
  const paramsParts = ref<THREE.Object3D[]>([]);
  const hiddenSceneParts = ref<any[]>([]);
  const camera = ref<Camera>();
  const sceneMeshes = ref<Record<string, THREE.Group | THREE.Object3D>>({});
  const fogControls = ref<FogControls | null>(null);
  const ground = ref<THREE.Mesh | null>(null);
  const skyContext = ref<CanvasRenderingContext2D | null>(null);
  const skyTexture = ref<THREE.CanvasTexture | null>(null);
  const skyMesh = ref<THREE.Mesh | null>(null);
  const sunLight = ref<THREE.DirectionalLight | null>(null);
  const hemiLight = ref<THREE.HemisphereLight | null>(null);
  const cameraOverlay = ref<THREE.Mesh | null>(null);
  const environment = ref<Environment | null>(null);
  const pollutionCloud = ref<THREE.Points | null>(null);

  const impactsParts = {
    fog: null as any,
    lake: null as THREE.Object3D | null,
    farmhouse: null as THREE.Object3D | null,
    rocks: null as THREE.Object3D | null,
    fields: null as THREE.Object3D | null,
    sheeps: null as THREE.Object3D | null,
    chickens: null as THREE.Object3D | null,
  };

  return {
    globalScene,
    scene3d,
    paramsParts,
    impactsParts,
    hiddenSceneParts,
    camera,
    sceneMeshes,
    fogControls,
    ground,
    skyContext,
    skyTexture,
    skyMesh,
    sunLight,
    hemiLight,
    cameraOverlay,
    environment,
    pollutionCloud,
  };
});
