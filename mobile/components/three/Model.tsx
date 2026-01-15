import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber/native";
import { useGLTF } from "@react-three/drei";
import { Asset } from "expo-asset";

export type ModelProps = {
    plane: number;
    onPlaneChange: (v: number) => void;
    transport: any;
    onTransportChange: (v: any) => void;
    promptIA: 0 | 33 | 66 | 100;
    onPromptIAChange: () => void;
    meat: boolean;
    onMeatChange: () => void;
    products: number;
    onProductsChange: (v: number) => void;
    phone: any;
    onPhoneChange: (v: any) => void;
    energy: 0 | 33 | 66 | 100;
    onEnergyChange: () => void;
    clothes: number;
    onClothesChange: (v: number) => void;
    isModelTurned: boolean;
    resultIsShown: boolean;
    feedbackIsShown: boolean;
    onReveal: (overrides?: any) => void;
    onCameraMovement: (type: string, value: number) => void;
    onYearChange: (value: number) => void;
};

export const Model = React.memo(function Model({
    plane,
    onPlaneChange,
    onTransportChange,
    promptIA,
    onPromptIAChange,
    meat,
    onMeatChange,
    products,
    onProductsChange,
    phone,
    onPhoneChange,
    energy,
    onEnergyChange,
    clothes,
    onClothesChange,
    isModelTurned,
    onReveal,
    onCameraMovement,
    onYearChange,
}: ModelProps) {
    const asset = Asset.fromModule(require("../../assets/3d/configurateur.glb"));
    if (!asset.localUri) asset.downloadAsync();
    const gltf = useGLTF(asset.localUri || asset.uri) as any;

    const groupRef = useRef<THREE.Group>(null);

    const cursor1 = useRef<THREE.Object3D | null>(null);
    const cursor5 = useRef<THREE.Object3D | null>(null);
    const cursor8 = useRef<THREE.Object3D | null>(null);

    const plane1 = useRef<THREE.Plane | null>(null);
    const plane5 = useRef<THREE.Plane | null>(null);
    const plane8 = useRef<THREE.Plane | null>(null);

    const dragging1 = useRef(false);
    const dragging5 = useRef(false);
    const dragging8 = useRef(false);
    const draggingGear = useRef(false);

    const intersection = useRef(new THREE.Vector3());
    const localPoint = useRef(new THREE.Vector3());
    const dragOffset = useRef(new THREE.Vector3());

    const lastCallTime = useRef(0);
    const lastPlane = useRef(plane);
    const lastProducts = useRef(products);
    const lastClothes = useRef(clothes);

    const pressed2 = useRef<string | null>(null);
    const pressed6 = useRef<string | null>(null);
    const pressedSpot = useRef<string | null>(null);

    const button2 = useRef<Record<string, THREE.Object3D | null>>({});
    const button3 = useRef<Record<string, THREE.Object3D | null>>({});
    const button4 = useRef<Record<string, THREE.Object3D | null>>({});
    const button6 = useRef<Record<string, THREE.Object3D | null>>({});
    const button7 = useRef<Record<string, THREE.Object3D | null>>({});
    const spots = useRef<Record<string, THREE.Object3D | null>>({});

    const realGear = useRef<THREE.Object3D | null>(null);
    const fakeGear = useRef<THREE.Object3D | null>(null);

    const gearStartY = useRef(0);
    const gearTarget = useRef(0);
    const gearCurrent = useRef(0);
    const gearAccum = useRef(0);

    const years = [2025, 2050, 2075, 2100];
    const yearIndex = useRef(0);
    const STEP_ROTATION = Math.PI / 0.5;

    useEffect(() => {
        if (!gltf?.scene) return;

        gltf.scene.traverse((child: any) => {
            if (!child.isMesh) return;
            child.userData.name = child.name;

            if (child.name === "gear-real") {
                child.visible = false;
                child.raycast = () => null;
                realGear.current = child;
            }
            if (child.name === "gear-fake") fakeGear.current = child;

            if (child.name === "1") {
                cursor1.current = child;
                const p = new THREE.Vector3();
                child.getWorldPosition(p);
                plane1.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -p.z);
            }
            if (child.name === "5") {
                cursor5.current = child;
                const p = new THREE.Vector3();
                child.getWorldPosition(p);
                plane5.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -p.z);
            }
            if (child.name === "8") {
                cursor8.current = child;
                const p = new THREE.Vector3();
                child.getWorldPosition(p);
                plane8.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -p.z);
            }

            if (["2a", "2b", "2c"].includes(child.name)) {
                button2.current[child.name] = child;
                child.userData.initialZ = child.position.z;
            }
            if (child.name === "3") {
                button3.current[child.name] = child;
                child.userData.initial = child.rotation.y;
            }
            if (child.name === "4") {
                button4.current[child.name] = child;
                child.userData.initial = child.rotation.z;
            }
            if (["6a", "6b"].includes(child.name)) {
                button6.current[child.name] = child;
                child.userData.initialZ = child.position.z;
            }
            if (child.name === "77") {
                button7.current[child.name] = child;
                child.userData.initial = child.rotation.y;
            }
            if (["spot-1", "spot-2", "spot-3"].includes(child.name)) {
                spots.current[child.name] = child;
                child.userData.initialZ = child.position.z;
            }
        });
    }, [gltf]);

    useFrame(() => {
        if (!groupRef.current) return;
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            isModelTurned ? -2.5 : 0,
            0.03
        );
    });

    useFrame(() => {
        Object.entries(button2.current).forEach(([k, b]) => {
            if (!b) return;
            const z = pressed2.current === k ? b.userData.initialZ - 0.3 : b.userData.initialZ;
            b.position.z = THREE.MathUtils.lerp(b.position.z, z, 0.2);
        });

        Object.values(button3.current).forEach((b: any) => {
            const i = promptIA === 0 ? 0 : promptIA === 33 ? 1 : promptIA === 66 ? 2 : 3;
            b.rotation.y = THREE.MathUtils.lerp(b.rotation.y, b.userData.initial - [0, -1.5, -3, -5][i], 0.05);
        });

        Object.values(button4.current).forEach((b: any) => {
            const z = meat ? b.userData.initial - 0.5 : b.userData.initial;
            b.rotation.z = THREE.MathUtils.lerp(b.rotation.z, z, 0.2);
        });

        Object.entries(button6.current).forEach(([k, b]) => {
            if (!b) return;
            const z = pressed6.current === k ? b.userData.initialZ - 0.2 : b.userData.initialZ;
            b.position.z = THREE.MathUtils.lerp(b.position.z, z, 0.2);
        });

        Object.values(button7.current).forEach((b: any) => {
            if (!b) return;
            const i = energy === 0 ? 0 : energy === 33 ? 1 : energy === 66 ? 2 : 3;
            b.rotation.y = THREE.MathUtils.lerp(b.rotation.y, b.userData.initial - [0, 1.7, 3.4, 5][i], 0.05);
        });

        Object.entries(spots.current).forEach(([k, b]) => {
            if (!b) return;
            const z = pressedSpot.current === k ? b.userData.initialZ - 0.3 : b.userData.initialZ;
            b.position.z = THREE.MathUtils.lerp(b.position.z, z, 0.2);
        });
    });

    const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        const name = (e.object as any)?.userData?.name;
        if (!name) return;
        (e.target as Element).setPointerCapture(e.pointerId);

        const setupDrag = (cursor: THREE.Object3D, plane: THREE.Plane) => {
            if (e.ray.intersectPlane(plane, intersection.current)) {
                if (cursor.parent) {
                    localPoint.current.copy(intersection.current);
                    cursor.parent.worldToLocal(localPoint.current);
                    dragOffset.current.set(
                        localPoint.current.x - cursor.position.x,
                        localPoint.current.y - cursor.position.y,
                        0
                    );
                }
            }
        };

        if (name === "1" && cursor1.current && plane1.current) {
            dragging1.current = true;
            setupDrag(cursor1.current, plane1.current);
        }
        if (name === "5" && cursor5.current && plane5.current) {
            dragging5.current = true;
            setupDrag(cursor5.current, plane5.current);
        }
        if (name === "8" && cursor8.current && plane8.current) {
            dragging8.current = true;
            setupDrag(cursor8.current, plane8.current);
        }

        const transportsBtn: Record<"2a" | "2b" | "2c", number> = {
            "2a": 100,
            "2b": 50,
            "2c": 0,
        };
        if (["2a", "2b", "2c"].includes(name)) {
            pressed2.current = name;
            onTransportChange( transportsBtn[name as "2a" | "2b" | "2c"]);
            onReveal();
        }

        if (name === "3") { onPromptIAChange(); onReveal(); }
        if (name === "4") { onMeatChange(); onReveal(); }
        if (["6a", "6b"].includes(name)) { pressed6.current = name; onPhoneChange(name === "6a" ? 100 : 0); onReveal(); }
        if (name === "77") { onEnergyChange(); onReveal(); }

        const spotMap: Record<"spot-1" | "spot-2" | "spot-3", number> = {
            "spot-1": 1,
            "spot-2": 2,
            "spot-3": 3,
        };

        if (["spot-1", "spot-2", "spot-3"].includes(name)) {
            pressedSpot.current = name;
            onCameraMovement("CAMERA_SPOT", spotMap[name as "spot-1" | "spot-2" | "spot-3"]);
        }
        if (name === "gear-real") {
            draggingGear.current = true;
            gearStartY.current = e.intersections[0]?.point.y ?? 0;
        }
    }, [onTransportChange, onPromptIAChange, onMeatChange, onPhoneChange, onEnergyChange, onReveal, onCameraMovement]);


    const onPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
        (e.target as Element).releasePointerCapture(e.pointerId);
        
        if (dragging1.current || dragging5.current || dragging8.current) {
            onReveal(); 
        }

        dragging1.current = false;
        dragging5.current = false;
        dragging8.current = false;
        draggingGear.current = false;
    }, []);

    useFrame((state) => {
        const now = Date.now();
        const THROTTLE_DELAY = 50;

        const getLocalPosition = (cursor: THREE.Object3D, plane: THREE.Plane) => {
            if (state.raycaster.ray.intersectPlane(plane, intersection.current)) {
                if (cursor.parent) {
                    localPoint.current.copy(intersection.current);
                    cursor.parent.worldToLocal(localPoint.current);
                    return localPoint.current;
                }
            }
            return null;
        };

        if (draggingGear.current && realGear.current) {
            const intersects = state.raycaster.intersectObject(realGear.current, false);
            if (intersects.length > 0) {
                const deltaY = intersects[0].point.y - gearStartY.current;
                const rotationSpeed = 2;
                const deltaRotation = deltaY * rotationSpeed;
                gearTarget.current += deltaRotation;
                gearAccum.current += deltaRotation;
                gearStartY.current = intersects[0].point.y;
            }
        }

        if (realGear.current) {
            gearCurrent.current = THREE.MathUtils.lerp(gearCurrent.current, gearTarget.current, 0.1);
            realGear.current.rotation.x = gearCurrent.current;
        }

        if (Math.abs(gearAccum.current) >= STEP_ROTATION) {
            const direction = Math.sign(gearAccum.current);
            yearIndex.current = THREE.MathUtils.clamp(yearIndex.current + direction, 0, years.length - 1);
            onYearChange(years[yearIndex.current]);
            gearAccum.current -= STEP_ROTATION * direction;
        }

        if (dragging1.current && cursor1.current && plane1.current) {
            const pos = getLocalPosition(cursor1.current, plane1.current);
            if (pos) {
                const min = -1.9, max = 3.2;
                const val = THREE.MathUtils.mapLinear(Math.max(min, Math.min(max, pos.x - dragOffset.current.x)), min, max, 0, 100);
                if (now - lastCallTime.current > THROTTLE_DELAY) { 
                    onPlaneChange(val);
                    lastPlane.current = val;
                    lastCallTime.current = now;
                }
                cursor1.current.position.x = THREE.MathUtils.mapLinear(val, 0, 100, min, max);
            }
        }

        if (dragging5.current && cursor5.current && plane5.current) {
            const pos = getLocalPosition(cursor5.current, plane5.current);
            if (pos) {
                const min = -4.6, max = -0.8;
                const val = THREE.MathUtils.mapLinear(Math.max(min, Math.min(max, pos.y - dragOffset.current.y)), min, max, 0, 100);
                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    onProductsChange(val);
                    lastProducts.current = val;
                    lastCallTime.current = now;
                }
                cursor5.current.position.y = THREE.MathUtils.mapLinear(val, 0, 100, min, max);
            }
        }

        if (dragging8.current && cursor8.current && plane8.current) {
            const pos = getLocalPosition(cursor8.current, plane8.current);
            if (pos) {
                const min = -2.4, max = 6.8;
                const val = THREE.MathUtils.mapLinear(Math.max(min, Math.min(max, pos.x - dragOffset.current.x)), max, min, 0, 100);
                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    onClothesChange(val);
                    lastClothes.current = val;
                    lastCallTime.current = now;
                }
                cursor8.current.position.x = THREE.MathUtils.mapLinear(val, 0, 100, max, min);
            }
        }
    });

    return (
        <group
            ref={groupRef}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
        >
            <primitive object={gltf.scene} scale={2} />
        </group>
    );
});
