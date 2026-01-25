import * as THREE from "three";
import gsap from "gsap";
import { useAudio } from "~/composables/useAudio";
import { updateImpactNumber } from "./experience";
import type { impactType } from "~/types/config";

// appear sound
const { playReveal } = useAudio();

export function setupParamsInstances() {
  const worldStore = useWorld();

  const allMeshes: Record<string, any> = {};
  const targetGroups: Record<string, THREE.Group> = {};

  //stock meshes in objects
  worldStore.paramsParts.forEach((group) => {
    allMeshes[group.name] = {};

    if (!group.name.includes("group")) return;

    group.children.forEach((child) => {
      child.children.forEach((c) => {
        if (c instanceof THREE.Mesh) {
          c.visible = false;
          if (c.name.includes("best")) {
            stockMesh("best", c);
          } else if (c.name.includes("normal")) {
            stockMesh("normal", c);
          } else if (c.name.includes("bad")) {
            stockMesh("bad", c);
          } else if (c.name.includes("worst")) {
            stockMesh("worst", c);
          }
        }
      });
    });
  });
  worldStore.paramsParts = [];

  //create instances
  Object.values(allMeshes).forEach((meshesType) => {
    Object.values(meshesType as THREE.Mesh[][]).forEach((meshGroup) => {
      if (!meshGroup[0]) return;
      const mesheNumbers = meshGroup.length;
      const targetGroup = meshGroup[0]?.parent?.parent?.name;
      const targetType = meshGroup[0].name;

      if (!targetGroup) return;

      if (!targetGroups[targetGroup]) {
        const newGroup = new THREE.Group();
        newGroup.name = targetGroup;
        targetGroups[targetGroup] = newGroup;
        worldStore.scene3d?.add(newGroup);
      }

      const instancedMesh = new THREE.InstancedMesh(
        meshGroup[0]?.geometry,
        meshGroup[0]?.material,
        mesheNumbers,
      );
      instancedMesh.name = targetType;

      if (worldStore.scene3d) worldStore.scene3d.updateMatrixWorld(true);

      const parentMatrix = worldStore.scene3d!.matrixWorld;
      const parentInverse = new THREE.Matrix4().copy(parentMatrix).invert();

      const tempMatrix = new THREE.Matrix4();

      for (let i = 0; i < mesheNumbers; i++) {
        const ogObject = meshGroup[i];
        if (!ogObject) continue;

        ogObject.updateMatrixWorld();

        tempMatrix.copy(ogObject.matrixWorld);
        tempMatrix.premultiply(parentInverse);

        instancedMesh.setMatrixAt(i, tempMatrix);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      instancedMesh.frustumCulled = false;
      instancedMesh.castShadow = true;
      instancedMesh.userData.originalMatrix =
        instancedMesh.instanceMatrix.clone();
      // console.log("___________", instancedMesh.userData);

      targetGroups[targetGroup].add(instancedMesh);

      //stock mesh in store object
      worldStore.sceneMeshes[targetGroup] = markRaw(targetGroups[targetGroup]);
      if (!worldStore.paramsParts.includes(targetGroups[targetGroup])) {
        worldStore.paramsParts.push(markRaw(targetGroups[targetGroup]));
      }

      //delete old meshes
      meshGroup.forEach((mesh) => {
        const parent = mesh.parent;
        mesh.removeFromParent();

        if (parent && parent.children.length === 0) {
          parent.removeFromParent();
        }
      });
      //DELETE THE BASE mesh
      worldStore.globalScene?.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          if (
            o.name.includes("normal") ||
            o.name.includes("bad") ||
            o.name.includes("worst") ||
            o.name.includes("best")
          ) {
            o.visible = false;
          }
        }
      });
    });
  });

  /*functions*/

  //stock mesh & create objects
  function stockMesh(
    type: "best" | "normal" | "bad" | "worst",
    object: THREE.Mesh,
  ) {
    if (!allMeshes[object.parent!.parent!.name][type]) {
      allMeshes[object.parent!.parent!.name][type] = [];
    }
    allMeshes[object.parent!.parent!.name][type].push(object);
  }
}

export function setupDecorInstances() {
  const worldStore = useWorld();

  const instancesGroup: THREE.Object3D[] = [];

  worldStore.globalScene?.traverse((child) => {
    if (child.name.includes("DECORS")) {
      child.children.forEach((c) => {
        if (c.name.includes("instance")) {
          instancesGroup.push(markRaw(c));
        }
      });
    }
  });

  instancesGroup.forEach((group) => {
    const firstChild = group.children[0] as THREE.Mesh;

    const instancedMesh = new THREE.InstancedMesh(
      firstChild.geometry,
      firstChild.material,
      group.children.length,
    );
    instancedMesh.name = group.name;

    if (worldStore.scene3d) worldStore.scene3d.updateMatrixWorld(true);

    const parentMatrix = worldStore.scene3d!.matrixWorld;
    const parentInverse = new THREE.Matrix4().copy(parentMatrix).invert();

    const tempMatrix = new THREE.Matrix4();

    for (let i = 0; i < group.children.length; i++) {
      const ogObject = group.children[i];

      if (!ogObject) continue;

      ogObject.updateMatrixWorld();

      tempMatrix.copy(ogObject.matrixWorld);
      tempMatrix.premultiply(parentInverse);

      instancedMesh.setMatrixAt(i, tempMatrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.frustumCulled = true;
    instancedMesh.castShadow = true;

    worldStore.globalScene!.add(instancedMesh);

    group.children.forEach((mesh) => {
      const parent = mesh.parent;
      mesh.removeFromParent();

      if (parent && parent.children.length === 0) {
        parent.removeFromParent();
      }
    });
  });
}

export function hideElements() {
  const worldStore = useWorld();
  worldStore.hiddenSceneParts = [];

  Object.values(worldStore.sceneMeshes).forEach((meshGroup) => {
    if (
      meshGroup.name.includes("sheeps") ||
      meshGroup.name.includes("chickens") ||
      meshGroup.name.includes("City")
    ) {
      meshGroup.position.y = -10;
      worldStore.hiddenSceneParts.push(markRaw(meshGroup));
    } else {
      meshGroup.children.forEach((mesh) => {
        mesh.visible = false;
        if (mesh.name.includes("normal") || mesh.name.includes("mid")) {
          mesh.position.y = -10;
          worldStore.hiddenSceneParts.push(markRaw(mesh));
        }
      });
    }
  });
}

export function revealElements() {
  playReveal();
  const configStore = useConfig();
  const worldStore = useWorld();

  if (configStore.formParams.currentStep >= configStore.formParams.step) return;
  if (worldStore.hiddenSceneParts.length < 1) return;

  let stepsRemaining =
    configStore.formParams.step - configStore.formParams.currentStep;
  if (stepsRemaining < 1) stepsRemaining = 1;

  const numberToReveal = Math.ceil(
    worldStore.hiddenSceneParts.length / stepsRemaining,
  );

  for (let i = 0; i < numberToReveal; i++) {
    if (worldStore.hiddenSceneParts.length === 0) break;

    const randIndex = Math.floor(
      Math.random() * worldStore.hiddenSceneParts.length,
    );
    const partToReveal = worldStore.hiddenSceneParts[randIndex];

    if (partToReveal) {
      partToReveal.visible = true;

      gsap.to(partToReveal.position, {
        y: 0,
        duration: 1,
        ease: "power2.out",
        delay: i * 0.05,
      });

      worldStore.hiddenSceneParts.splice(randIndex, 1);
    }
  }

  configStore.formParams.currentStep += 1;
}
/*___________INSTANCE CHILDRENS_________*/

export function calculateParmasAssetsNumber(
  instancedMesh: THREE.InstancedMesh,
) {
  let visibleInstancePercentage = 0;
  const randomMultiplier = Math.random() * 0.2 + 0.8;

  if (instancedMesh.name.includes("best")) {
    visibleInstancePercentage = 100 * randomMultiplier;
  } else if (instancedMesh.name.includes("normal")) {
    visibleInstancePercentage = 85 * randomMultiplier;
  } else if (instancedMesh.name.includes("bad")) {
    visibleInstancePercentage = 75 * randomMultiplier;
  } else if (instancedMesh.name.includes("worst")) {
    visibleInstancePercentage = 65 * randomMultiplier;
  }

  const targetInstances = Math.round(
    instancedMesh.count -
      (instancedMesh.count / 100) * visibleInstancePercentage,
  );

  for (let i = 0; i < targetInstances; i++) {
    hideInstanceChildren(
      instancedMesh,
      instancedMesh.userData.childrenArray[i]!,
    );
  }
}

export function hideInstanceChildren(
  instancedMesh: THREE.InstancedMesh,
  index: number,
) {
  const dummy = new THREE.Object3D();

  instancedMesh.getMatrixAt(index, dummy.matrix);
  dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

  dummy.scale.set(0, 0, 0);
  dummy.updateMatrix();

  instancedMesh.setMatrixAt(index, dummy.matrix);
  instancedMesh.instanceMatrix.needsUpdate = true;
}

export function resetParmasAssets(instancedMesh: THREE.InstancedMesh) {
  instancedMesh.instanceMatrix.copy(instancedMesh.userData.originalMatrix);

  instancedMesh.instanceMatrix.needsUpdate = true;
}

export function setupAllImpacts() {
  const worldStore = useWorld();

  // allMeshes : { "Forest": { "high": [], "low": [] }, "TreesPool": { "default": [] } }
  const allMeshes: Record<string, Record<string, THREE.Mesh[]>> = {};

  // On renomme cette variable car elle peut contenir soit un Group, soit un InstancedMesh
  const generatedObjects: Record<string, THREE.Object3D> = {};

  const impactNamesMap: Record<string, string> = {};
  const keysToRemove: string[] = [];

  // =========================================================
  // ÉTAPE 1 : COLLECTE DES "STATES" (Inchangé)
  // =========================================================
  Object.entries(worldStore.impactsParts).forEach(([key, value]) => {
    if (!value) return;

    if (value.name.includes("states-instances")) {
      keysToRemove.push(key);
      const impactName = key;
      impactNamesMap[value.name] = impactName;
      if (!allMeshes[value.name]) allMeshes[value.name] = {};

      value.children.forEach((child: any) => {
        child.children.forEach((c: any) => {
          if (c instanceof THREE.Mesh) {
            c.visible = false;
            if (c.name.includes("high")) stockMesh(value.name, "high", c);
            else if (c.name.includes("mid")) stockMesh(value.name, "mid", c);
            else if (c.name.includes("low")) stockMesh(value.name, "low", c);
          }
        });
      });
    } else if (value.name.includes("states-raw")) {
      const impactName = key;
      impactNamesMap[value.name] = impactName;

      value.children.forEach((child: any) => {
        // if (child instanceof THREE.Mesh) {
        if (child.name.includes("high") || child.name.includes("low")) {
          child.visible = false;
        } else if (child.name.includes("mid")) {
          child.visible = true;
        }
        // }
      });
      worldStore.sceneMeshes[value.name] = markRaw(value);
    }
  });

  // =========================================================
  // ÉTAPE 2 : COLLECTE DES "POOLS" (Inchangé)
  // =========================================================
  worldStore.globalScene?.traverse((child) => {
    if (child.name.includes("IMPACTS")) {
      child.children.forEach((group) => {
        if (group.name.includes("pool")) {
          if (!allMeshes[group.name]) allMeshes[group.name] = {};

          const matchingKey = Object.keys(worldStore.impactsParts).find((k) =>
            group.name.includes(k),
          );

          if (matchingKey) impactNamesMap[group.name] = matchingKey;

          group.children.forEach((mesh) => {
            if (mesh instanceof THREE.Mesh) {
              stockMesh(group.name, "default", mesh);
            }
          });

          //  updateImpactNumber ({
          //     name: matchingKey as impactType["name"],
          //     value: 0.2,
          //   });
        }
      });
    }
  });

  // =========================================================
  // ÉTAPE 3 : NETTOYAGE DU STORE (Inchangé)
  // =========================================================
  keysToRemove.forEach((key) => delete worldStore.impactsParts[key]);

  // =========================================================
  // ÉTAPE 4 : GÉNÉRATION INTELLIGENTE (Group VS InstancedMesh)
  // =========================================================

  if (worldStore.scene3d) worldStore.scene3d.updateMatrixWorld(true);
  const parentMatrix = worldStore.scene3d!.matrixWorld;
  const parentInverse = new THREE.Matrix4().copy(parentMatrix).invert();
  const tempMatrix = new THREE.Matrix4();

  Object.entries(allMeshes).forEach(([groupName, meshesByType]) => {
    const logicalName = impactNamesMap[groupName] || groupName;
    const meshTypes = Object.keys(meshesByType);

    // DÉCISION : Est-ce un Pool (Direct) ou un State (Group) ?
    // Si on a un seul type et que c'est "default", on considère que c'est un Pool simple.
    const isSimplePool = meshTypes.length === 1 && meshTypes[0] === "default";

    let finalObject: THREE.Object3D;

    if (isSimplePool) {
      // --- CAS A : POOL (Direct InstancedMesh) ---
      const meshList = meshesByType["default"];

      const instancedMesh = createInstancedMeshFromList(
        meshList,
        groupName,
        "default",
      );

      // On nomme l'instance directement avec le nom logique (ex: "forest")
      instancedMesh.name = logicalName;
      instancedMesh.castShadow = true;

      worldStore.scene3d?.add(instancedMesh);
      finalObject = instancedMesh;
    } else {
      // --- CAS B : STATES (Group Container avec LODs) ---
      const group = new THREE.Group();
      group.name = logicalName;

      Object.entries(meshesByType).forEach(([type, meshList]) => {
        const instancedMesh = createInstancedMeshFromList(
          meshList,
          groupName,
          type,
        );
        group.add(instancedMesh);
        instancedMesh.castShadow = true;
      });

      worldStore.scene3d?.add(group);
      finalObject = group;
    }

    // =========================================================
    // ÉTAPE 5 : STOCKAGE FINAL
    // =========================================================

    // 1. Stockage technique
    worldStore.sceneMeshes[groupName] = markRaw(finalObject);

    // 2. Stockage logique (Store)
    const storeKey = impactNamesMap[groupName];

    if (storeKey) {
      if (!worldStore.impactsParts[storeKey]) {
        worldStore.impactsParts[storeKey] = markRaw(finalObject);
      }
    } else {
      if (!worldStore.impactsParts[groupName]) {
        worldStore.impactsParts[groupName] = markRaw(finalObject);
      }
    }
    if (isSimplePool && storeKey) {
      updateImpactNumber({
        name: storeKey as impactType["name"],
        value: 20,
      });
    }
  });

  cleanupSceneArtifacts(worldStore);

  /* --- HELPER FUNCTION POUR EVITER LA DUPLICATION DE CODE --- */
  function createInstancedMeshFromList(
    meshList: THREE.Mesh[],
    groupName: string,
    type: string,
  ) {
    if (!meshList || meshList.length === 0)
      return new THREE.InstancedMesh(undefined, undefined, 0);

    const count = meshList.length;
    const geometry = meshList[0].geometry;
    const material = meshList[0].material;

    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    // Si c'est un pool simple, le nom sera écrasé par logicalName plus haut, sinon ça garde ce format
    instancedMesh.name = `${groupName}_${type}`;

    for (let i = 0; i < count; i++) {
      const original = meshList[i];
      original.updateMatrixWorld();

      tempMatrix.copy(original.matrixWorld);
      tempMatrix.premultiply(parentInverse);
      instancedMesh.setMatrixAt(i, tempMatrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.frustumCulled = true;

    // Nettoyage des originaux
    meshList.forEach((mesh) => {
      const parent = mesh.parent;
      mesh.removeFromParent();
      if (parent && parent.children.length === 0) parent.removeFromParent();
    });

    return instancedMesh;
  }

  /* --- UTILITAIRES --- */
  function stockMesh(groupName: string, type: string, mesh: THREE.Mesh) {
    if (!allMeshes[groupName][type]) allMeshes[groupName][type] = [];
    allMeshes[groupName][type].push(mesh);
  }

  function cleanupSceneArtifacts(store: any) {
    store.globalScene?.traverse((o: any) => {
      if (o instanceof THREE.Mesh) {
        if (
          ["normal", "bad", "worst", "best", "high", "mid", "low"].some((tag) =>
            o.name.includes(tag),
          )
        ) {
          o.visible = false;
        }
      }
    });
  }
}

export function updateCity(temperature: number) {
  const worldStore = useWorld();
  const configStore = useConfig();

  const cityGroup = worldStore.globalScene?.getObjectByName("City")!;

  const citySpotNumber = cityGroup.children.length;

  const focusedSpot = Math.round(
    (temperature / configStore.configParams.maxTemperature) * citySpotNumber,
  );

  for (let i = 0; i < cityGroup.children.length!; i++) {
    const citySpot = cityGroup.children[i]!;

    citySpot.children.forEach((child) => {
      if (child.name.includes("house")) {
        if (i < focusedSpot) {
          child.visible = false;
        } else {
          child.visible = true;
        }
      } else if (child.name.includes("building")) {
        if (i < focusedSpot) {
          child.visible = true;
        } else {
          child.visible = false;
        }
      }
    });
  }
}
