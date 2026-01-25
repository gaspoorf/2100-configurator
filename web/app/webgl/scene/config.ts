import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import type { UserConfigType } from "~/types/config";
import Camera from "./Camera";
import Environment from "./Environment";
import { moveToStep } from "./experience";

import {
  hideElements,
  setupAllImpacts,
  setupDecorInstances,
  setupParamsInstances,
  updateCity,
} from "./elementsManager";

export function initScene(): Promise<void> {
  return new Promise((resolve, reject) => {
    const worldStore = useWorld();
    const configStore = useConfig();
    const container = document.querySelector(".scene");
    if (!container) return;
    const globalScene = new THREE.Scene();

    worldStore.globalScene = globalScene;
    worldStore.camera = new Camera();
    globalScene.add(worldStore.camera.instance);

    if (worldStore.camera.overlay) {
      worldStore.cameraOverlay = markRaw(worldStore.camera.overlay);
    }

    const canvas = container.querySelector("canvas");
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);

    const environment = new Environment(globalScene, renderer);

    worldStore.skyContext = environment.getSkyContext();
    worldStore.skyTexture = environment.getSkyTexture();
    worldStore.skyMesh = markRaw(environment.getSkyMesh()!);
    worldStore.hemiLight = markRaw(environment.getHemiLight());
    worldStore.sunLight = markRaw(environment.getSunLight());
    worldStore.environment = markRaw(environment);
    if (environment.getPollutionCloud()) {
      worldStore.pollutionCloud = markRaw(environment.getPollutionCloud()!);
    }

    const loader = new GLTFLoader();
    loader.load(
      // "/3d/states.glb",
      // "/3d/2100-map__V1.glb",
      // "/3d/map.glb",
      // "/3d/map-v10.glb",
      "/3d/map-v33.glb",
      // "/3d/map-spots.glb",
      (gltf: any) => {
        gltf.scene.scale.set(1, 1, 1);

        gltf.scene.traverse((child: any) => {
          // booster les mat des objets

          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material.map) {
              child.material.map.colorSpace = THREE.SRGBColorSpace;
            }

            if (child.material.metalness > 0.5) child.material.metalness = 0.1;
            child.material.roughness = 0.7;
          }
        });

        globalScene.add(gltf.scene);

        // ground color
        const groundMesh = gltf.scene.getObjectByName("ground");
        if (groundMesh && groundMesh instanceof THREE.Mesh) {
          groundMesh.material = groundMesh.material.clone();
          groundMesh.material.color = new THREE.Color(0x007411);
          worldStore.ground = markRaw(groundMesh);
        }

        const target = globalScene.getObjectByName("Scene");
        worldStore.scene3d = markRaw(target as THREE.Group);

        // spots pov
        const spots = [
          gltf.scene.getObjectByName("spot-1"),
          gltf.scene.getObjectByName("spot-2"),
          gltf.scene.getObjectByName("spot-3"),
        ]
          .filter(Boolean)
          .map((s) => markRaw(s));
        const lookAts = [
          gltf.scene.getObjectByName("target-1"),
          gltf.scene.getObjectByName("target-2"),
          gltf.scene.getObjectByName("target-3"),
        ]
          .filter(Boolean)
          .map((s) => markRaw(s));

        if (worldStore.camera) {
          worldStore.camera.setSpots(spots, lookAts);
          worldStore.camera.goToSpot(0);
        }

        const sceneChildrens = worldStore.scene3d?.children;

        sceneChildrens?.forEach((child) => {
          if (child.name.includes("group")) {
            worldStore.paramsParts.push(markRaw(child));
          } else if (child.name.includes("IMPACTS")) {
            child.children.forEach((c) => {
              if (c.name.includes("fields")) {
                worldStore.impactsParts.fields = markRaw(c);
              } else if (c.name.includes("lake")) {
                worldStore.impactsParts.lake = markRaw(c);
              } else if (c.name.includes("farm_buildings")) {
                worldStore.impactsParts.farmhouse = markRaw(c);
              }
            });
          } else if (child.name.includes("City")) {
            worldStore.sceneMeshes["city"] = markRaw(child);
          }
        });
        let meshCount = 0;
        globalScene.traverse((object) => {
          meshCount++;
        });

        setupParamsInstances();
        // setupImpactsInstances();
        // setupImpactsPool();
        setupAllImpacts();
        setupDecorInstances();
        updateCity(configStore.configParams.currentTemperature);

        hideElements();

        environment.initFog();
        worldStore.fogControls = environment.getFogControls();

        resolve();
      },
      undefined,
      reject,
    );

    function animate() {
      requestAnimationFrame(animate);

      if (worldStore.environment) {
        worldStore.environment.tick();
      }

      renderer.render(globalScene, worldStore.camera!.instance);
    }
    animate();

    window.addEventListener("resize", () => {
      if (!container) return;
      worldStore.camera!.instance.aspect =
        container.clientWidth / container.clientHeight;
      worldStore.camera!.instance.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  });
}

export function handleFormValidations(userData: UserConfigType) {
  const uiStore = useUi();
  const configStore = useConfig();
  const finalUserData: any = {};

  configStore.isFormValidated = true;
  configStore.formParams.currentStep = 0;
  const worldStore = useWorld();
  // worldStore.camera?.entryAnim();

  Object.entries(userData).forEach(([key, value]) => {
    switch (key) {
      case "plane":
        finalUserData.plane = {
          weight: configStore.worldParams[key].globalWeight,
          percentage: value,
        };
        break;
      case "transport":
        finalUserData.transport = {
          weight: configStore.worldParams[key].globalWeight,
          percentage: value,
        };
        break;
      case "meat":
        finalUserData.meat = {
          weight: configStore.worldParams[key].globalWeight,
          percentage: value,
        };
        break;
      case "promptIA":
        finalUserData.promptIA = {
          weight: configStore.worldParams[key].globalWeight,
          percentage: value,
        };
        break;
      case "products":
        finalUserData.products = {
          weight: configStore.worldParams[key].globalWeight,
          percentage: value,
        };
        break;
      case "phone":
        finalUserData.phone = {
          weight: configStore.worldParams[key].globalWeight,
          percentage: value,
        };
        break;
      case "energy":
        finalUserData.energy = {
          weight: configStore.worldParams[key].globalWeight,
          percentage: value,
        };
        break;
      case "clothes":
        finalUserData.clothes = {
          weight: configStore.worldParams[key].globalWeight,
          percentage: value,
        };
        break;
      default:
        console.log("unknow param");
        break;
    }
  });

  configStore.userConfig = finalUserData;

  calculateExperienceSteps();
  setupObjectsData();
  moveToStep(0);
}

function calculateExperienceSteps() {
  const configStore = useConfig();
  const currentYear = configStore.configParams.currentYear;
  const targetYear = configStore.configParams.targetYear;
  const yearsPerStep = configStore.configParams.yearsStep;

  const stepYears: number[] = [currentYear];

  let nextYear = currentYear + yearsPerStep;
  while (nextYear <= targetYear - yearsPerStep) {
    stepYears.push(nextYear);
    nextYear += yearsPerStep;
  }

  if (stepYears[stepYears.length - 1] !== targetYear) {
    stepYears.push(targetYear);
  }

  const totalSteps = stepYears.length - 1;

  const worldStateSteps = [];

  const targetTemperature = calculateMaxTemperature();

  for (let i = 0; i <= totalSteps; i++) {
    const progress = i / totalSteps;

    const worldState: any = {
      params: {},
      impacts: {},
    };
    worldState.year = stepYears[i];
    Object.entries(configStore.userConfig).forEach(([key, value]) => {
      worldState.params[key] = value.percentage * progress;
    });
    worldState.temperature =
      configStore.configParams.currentTemperature +
      progress *
        (targetTemperature - configStore.configParams.currentTemperature);

    const currentWorldImpacts = {} as any;
    Object.keys(configStore.worldImpacts).forEach((impactKey) => {
      currentWorldImpacts[impactKey] = {
        value: configStore.configParams.currentImpactValue,
      };
    });

    Object.values(configStore.worldParams).forEach((param: any) => {
      const userParam = (configStore.userConfig as any)[param.name];
      const userGoalPercentage = userParam.percentage;
      const pivot = configStore.configParams.pivotScore;

      if (userGoalPercentage !== undefined) {
        param.impacts.forEach((impact: any) => {
          if (currentWorldImpacts[impact.type]) {
            let finalContribution = 0;

            if (userGoalPercentage > pivot) {
              finalContribution = (userGoalPercentage - pivot) * impact.weight;
            } else {
              const improvementRatio = (pivot - userGoalPercentage) / pivot;

              finalContribution =
                -1 *
                (improvementRatio *
                  configStore.configParams.currentImpactValue *
                  impact.weight);
            }

            currentWorldImpacts[impact.type].value +=
              finalContribution * progress;

            currentWorldImpacts[impact.type].value = parseFloat(
              currentWorldImpacts[impact.type].value.toFixed(4),
            );
          }
        });
      }
    });
    worldState.impacts = currentWorldImpacts;
    worldStateSteps.push(worldState);
  }
  configStore.worldStateSteps = worldStateSteps;
  console.log(worldStateSteps);
}

function calculateMaxTemperature() {
  const configStore = useConfig();

  const globalPercentage = Object.entries(
    configStore.userConfig,
  ).reduce<number>((acc, [key, value]) => {
    const weight = value.weight;
    return acc + value.percentage * weight;
  }, 0);

  configStore.globalPercentage = globalPercentage;
  let targetTemp: number;
  if (configStore.configParams.pivotScore >= globalPercentage) {
    const improvementRatio =
      (configStore.configParams.pivotScore - globalPercentage) /
      configStore.configParams.pivotScore;

    targetTemp =
      configStore.configParams.currentTemperature -
      improvementRatio *
        (configStore.configParams.currentTemperature -
          configStore.configParams.minTemperature);
  } else {
    const degradationRatio =
      (globalPercentage - configStore.configParams.pivotScore) /
      (100 - configStore.configParams.pivotScore);

    targetTemp =
      configStore.configParams.currentTemperature +
      degradationRatio *
        (configStore.configParams.maxTemperature -
          configStore.configParams.currentTemperature);
  }

  return targetTemp;
}

function setupObjectsData() {
  const worldStore = useWorld();
  const configStore = useConfig();

  const objectDataMap: Record<string, any> = {
    trees1: configStore.objectsData.trees1,
    trees2: configStore.objectsData.trees2,
    trees3: configStore.objectsData.trees3,
    bushes: configStore.objectsData.bushes,
    flowers: configStore.objectsData.flowers,
  };

  worldStore.paramsParts.forEach((paramPart) => {
    const objectType = Object.keys(objectDataMap).find((key) =>
      paramPart.name.includes(key),
    );

    if (objectType) {
      paramPart.children.forEach((child) => {
        if (child instanceof THREE.InstancedMesh) {
          child.userData.states = objectDataMap[objectType];

          let instancedMeshCountArray = [];
          for (let i = 0; i < child.count; i++) {
            instancedMeshCountArray.push(i);
          }
          instancedMeshCountArray.sort(() => Math.random() - 0.5);

          child.userData.childrenArray = instancedMeshCountArray;
        }
      });
    }
  });
}
