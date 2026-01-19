import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber/native";
import { useGLTF } from "@react-three/drei";
import { Asset } from "expo-asset";
import * as Haptics from 'expo-haptics';

export type ModelProps = {
    plane: number;
    onPlaneChange: (v: number) => void;
    transport: 0 | 50 | 100;
    onTransportChange: (v: 0 | 50 | 100) => void;
    promptIA: 0 | 50 | 100;
    onPromptIAChange: () => void;
    meat: 0 | 100;
    onMeatChange: () => void;
    products: number;
    onProductsChange: (v: number) => void;
    phone: 0 | 100;
    onPhoneChange: (v: 0 | 100) => void;
    energy: 0 | 33 | 66 | 100;
    onEnergyChange: () => void;
    clothes: number;
    onClothesChange: (v: number) => void;
    isModelTurned: boolean;
    isModelAppear: boolean;
    onAppearFinished?: () => void;
    resultIsShown: boolean;
    feedbackIsShown: boolean;
    onReveal: (overrides?: any) => void;
    onCameraMovement: (type: string, value: number) => void;
    onYearChange: (value: number) => void;
    onResetClick: () => void;
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
    isModelAppear,
    onAppearFinished,
    onReveal,
    onCameraMovement,
    onYearChange,
    onResetClick,
}: ModelProps) {
    const asset = Asset.fromModule(require("../../assets/3d/config-only-color.glb"));
    if (!asset.localUri) asset.downloadAsync();
    const gltf = useGLTF(asset.localUri || asset.uri) as any;

    const [rotationDone, setRotationDone] = useState(false);

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

    const reset = useRef<Record<string, THREE.Object3D | null>>({});
    const pressedReset = useRef<string | null>(null);

    const realGear = useRef<THREE.Mesh | null>(null);
    const fakeGear = useRef<THREE.Mesh | null>(null);

    const gearStartY = useRef(0);
    const gearTarget = useRef(0);
    const gearCurrent = useRef(0);
    const gearAccum = useRef(0);

    const years = [2025, 2050, 2075, 2100];
    const yearIndex = useRef(0);
    const STEP_ROTATION = Math.PI / 1;

    const START_POSITION_Z = -90;
    const START_POSITION_X = 40;
    const START_POSITION_Y = 40;
    const START_ROTATION_Z =  -2;
    const START_ROTATION_X = Math.PI * 2 + 5.3;

    const isGearActive = useRef(false);


    // const START_POSITION_Z = 0;
    // const START_POSITION_X = 0;
    // const START_POSITION_Y = 0;
    // const START_ROTATION_Z = 0;
    // const START_ROTATION_X = 0;


    // haptics dragg
    const lastCursorHapticValue = useRef(0);
    // Pour suivre la dernière rotation de la gear qui a vibré
    const lastGearHapticRotation = useRef(0);

    // reset anim et boutons
    const resetAnim = useRef<Record<string, { progress: number; active: boolean }>>({});

    const resetScene = useCallback(() => {
        pressed2.current = null;
        pressed6.current = null;
        pressedSpot.current = null;
        dragging1.current = false;
        dragging5.current = false;
        dragging8.current = false;
        draggingGear.current = false;
        gearTarget.current = 0;
        gearCurrent.current = 0;
        gearAccum.current = 0;
        yearIndex.current = 0;

        if (realGear.current) {
            realGear.current.rotation.x = 0;
        }

        Object.values(button2.current).forEach((b) => {
            if (!b) return;
            b.position.z = b.userData.initialZ;
        });

        Object.values(button3.current).forEach((b: any) => {
            b.rotation.y = b.userData.initial;
        });

        Object.values(button4.current).forEach((b: any) => {
            b.rotation.z = b.userData.initial;
        });

        Object.values(button6.current).forEach((b) => {
            if (!b) return;
            b.position.z = b.userData.initialZ;
        });

        Object.values(button7.current).forEach((b: any) => {
            b.rotation.y = b.userData.initial;
        });

        Object.values(spots.current).forEach((b) => {
            if (!b) return;
            b.position.z = b.userData.initialZ;
        });

        if (cursor1.current) cursor1.current.position.x = 0;
        if (cursor5.current) cursor5.current.position.y = 0;
        if (cursor8.current) cursor8.current.position.x = 0;
    }, []);


    useEffect(() => {
        if (!gltf?.scene) return;

        gltf.scene.traverse((child: any) => {
            if (!child.isMesh) return;
            child.userData.name = child.name;

            if (child.name === "gear-real") {
                realGear.current = child;
                child.visible = false;
                child.raycast = () => null;
            }
            if (child.name === "gear-fake") {
                fakeGear.current = child;
                child.visible = true;
            }

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
            if (child.name === "7") {
                button7.current[child.name] = child;
                child.userData.initial = child.rotation.y;
            }
            if (["spot-1", "spot-2", "spot-3"].includes(child.name)) {
                spots.current[child.name] = child;
                child.userData.initialZ = child.position.z;
            }
            if (child.name === "reset") {
                reset.current[child.name] = child;
                child.userData.initialZ = child.position.z;

                resetAnim.current[child.name] = { progress: 0, active: false };
            }
        });
    }, [gltf]);

    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.position.z = START_POSITION_Z;
            groupRef.current.position.x = START_POSITION_X;
            groupRef.current.position.y = START_POSITION_Y;
            groupRef.current.rotation.z = START_ROTATION_Z;
            groupRef.current.rotation.x = START_ROTATION_X;
        }
    }, []);

    // gerer les gears
    useEffect(() => {
        if (!realGear.current || !fakeGear.current) return;

        if (isModelTurned) {
            setTimeout(() => {
                if (!fakeGear.current || !realGear.current) return;
                fakeGear.current.visible = false;
                realGear.current.visible = true;
                realGear.current.raycast = THREE.Mesh.prototype.raycast;
                isGearActive.current = true;
            }, 1000);
        } else {
            fakeGear.current.visible = true;
            realGear.current.visible = false;
            realGear.current.raycast = () => null;
            isGearActive.current = false;
        }
    }, [isModelTurned]);


    useEffect(() => {
        if (realGear.current && isModelTurned) {
            const p = new THREE.Vector3();
            realGear.current.getWorldPosition(p);
            gearPlane.current.setFromNormalAndCoplanarPoint(
                new THREE.Vector3(0, 0, 1),
                p
            );
        }
    }, [isModelTurned]);


    useFrame(() => {
        if (!groupRef.current) return;

        groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            isModelTurned ? -2.5 : 0,
            0.03
        );

        if (isModelAppear && !rotationDone) {
            const targetPosition = 0;
            const targetRotationZ = 0;
            const targetRotation = Math.PI * 2;
            const ease = 0.05;

            groupRef.current.rotation.x = THREE.MathUtils.lerp(
                groupRef.current.rotation.x,
                targetRotation,
                ease
            );
            groupRef.current.position.x = THREE.MathUtils.lerp(
                groupRef.current.position.x,
                targetPosition,
                ease
            );
            groupRef.current.position.y = THREE.MathUtils.lerp(
                groupRef.current.position.y,
                targetPosition,
                ease
            );
            groupRef.current.position.z = THREE.MathUtils.lerp(
                groupRef.current.position.z,
                targetPosition,
                ease
            );
            groupRef.current.rotation.z = THREE.MathUtils.lerp(
                groupRef.current.rotation.z,
                targetRotationZ,
                ease
            );

            if (
                Math.abs(groupRef.current.rotation.x - targetRotation) < 0.01 &&
                Math.abs(groupRef.current.position.z - targetPosition) < 0.01 &&
                Math.abs(groupRef.current.position.x - targetPosition) < 0.01 &&
                Math.abs(groupRef.current.rotation.z - targetRotationZ) < 0.01
            ) {
                groupRef.current.rotation.x = targetRotation;
                groupRef.current.position.z = targetPosition;
                groupRef.current.position.x = targetPosition;
                groupRef.current.position.y = targetPosition
                groupRef.current.rotation.z = targetRotationZ;
                setRotationDone(true);
                onAppearFinished?.();
            }
        }
    });

    useFrame(() => {
        Object.entries(button2.current).forEach(([k, b]) => {
            if (!b) return;
            const z = pressed2.current === k ? b.userData.initialZ - 0.3 : b.userData.initialZ;
            b.position.z = THREE.MathUtils.lerp(b.position.z, z, 0.5);
        });

        Object.values(button3.current).forEach((b: any) => {
            const i = promptIA === 0 ? 0 : promptIA === 50 ? 1 : 2;
            b.rotation.y = THREE.MathUtils.lerp(b.rotation.y, b.userData.initial - [0, -1.2, -2.5][i], 0.5);
        });

        Object.values(button4.current).forEach((b: any) => {
            const z = meat === 0 ? b.userData.initial - 0.5 : b.userData.initial;
            b.rotation.z = THREE.MathUtils.lerp(b.rotation.z, z, 0.2);
        });

        Object.entries(button6.current).forEach(([k, b]) => {
            if (!b) return;
            const z = pressed6.current === k ? b.userData.initialZ - 0.2 : b.userData.initialZ;
            b.position.z = THREE.MathUtils.lerp(b.position.z, z, 0.5);
        });

        Object.values(button7.current).forEach((b: any) => {
            if (!b) return;
            const i = energy === 0 ? 0 : energy === 33 ? 0. : energy === 66 ? 2 : 3;
            b.rotation.y = THREE.MathUtils.lerp(b.rotation.y, b.userData.initial - [-1, -1.3, -2.5, -3][i], 0.05);
        });

        Object.entries(spots.current).forEach(([k, b]) => {
            if (!b) return;
            const z = pressedSpot.current === k ? b.userData.initialZ - (-0.3) : b.userData.initialZ;
            b.position.z = THREE.MathUtils.lerp(b.position.z, z, 0.2);
        });

        Object.entries(reset.current).forEach(([name, b]) => {
            if (!b) return;
            const anim = resetAnim.current[name];
            if (!anim || !anim.active) return;

            anim.progress += 0.1; 

            const t = Math.min(anim.progress, Math.PI);
            const offsetZ = Math.sin(t) * 0.2;

            b.position.z = THREE.MathUtils.lerp(
                b.position.z,
                b.userData.initialZ + offsetZ,
                0.6
            );

            if (anim.progress >= Math.PI) {
                anim.active = false;
                anim.progress = 0;
                b.position.z = b.userData.initialZ;
            }
        });
    });

    const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        const name = (e.object as any)?.userData?.name;
        if (!name) return;
        (e.target as Element).setPointerCapture(e.pointerId);

        const triggerHaptic = () => {
            // Light pour un clic subtil, Medium pour un clic plus franc
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        };

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
            lastCursorHapticValue.current = plane;
            setupDrag(cursor1.current, plane1.current);
        }
        if (name === "5" && cursor5.current && plane5.current) {
            dragging5.current = true;
            lastCursorHapticValue.current = products;
            setupDrag(cursor5.current, plane5.current);
        }
        if (name === "8" && cursor8.current && plane8.current) {
            dragging8.current = true;
            lastCursorHapticValue.current = clothes;
            setupDrag(cursor8.current, plane8.current);
        }

        const transportsBtn: Record<"2a" | "2b" | "2c", 0 | 50 | 100> = {
            "2a": 0,
            "2b": 50,
            "2c": 100,
        };
        if (["2a", "2b", "2c"].includes(name)) {
            triggerHaptic();
            const key = name as "2a" | "2b" | "2c";
            pressed2.current = key;
            onTransportChange(transportsBtn[key]);
            onReveal();
        }

        if (name === "3") { triggerHaptic(); onPromptIAChange(); onReveal(); }
        if (name === "4") { triggerHaptic(); onMeatChange(); onReveal(); }
        if (["6a", "6b"].includes(name)) { 
            triggerHaptic();
            pressed6.current = name; 
            onPhoneChange(name === "6a" ? 100 : 0); 
            onReveal(); 
        }
        if (name === "7") {triggerHaptic(); onEnergyChange(); onReveal(); }

        const spotMap: Record<"spot-1" | "spot-2" | "spot-3", number> = {
            "spot-1": 1,
            "spot-2": 2,
            "spot-3": 3,
        };

        if (["spot-1", "spot-2", "spot-3"].includes(name)) {
            triggerHaptic();
            pressedSpot.current = name;
            onCameraMovement("CAMERA_SPOT", spotMap[name as "spot-1" | "spot-2" | "spot-3"]);
        }
        if (name === "reset") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const anim = resetAnim.current[name];
            if (anim) {
                anim.active = true;
                anim.progress = 0;
            }
            resetScene();
            onResetClick();
        }
        if (name === "gear-real" && isGearActive.current) {
            triggerHaptic();
            draggingGear.current = true;
            gearTarget.current = gearCurrent.current;
            
            if (realGear.current) {
                const gearPos = new THREE.Vector3();
                realGear.current.getWorldPosition(gearPos);
                gearPlane.current.setFromNormalAndCoplanarPoint(
                    new THREE.Vector3(0, 0, 1),
                    gearPos
                );
            }
            
            const hit = e.ray.intersectPlane(gearPlane.current, intersection.current);
            if (hit) {
                gearStartY.current = hit.y;
            } 
        }
        if (name === "gear-fake") {
            fakeGear.current!.visible = false;
        }
    }, [onTransportChange, onPromptIAChange, onMeatChange, onPhoneChange, onEnergyChange, onReveal, onCameraMovement, onResetClick]);


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


    const gearPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));

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
            const gearPos = new THREE.Vector3();
            realGear.current.getWorldPosition(gearPos);
            gearPlane.current.setFromNormalAndCoplanarPoint(
                new THREE.Vector3(0, 0, 1),
                gearPos
            );

            const GEAR_NOTCH_STEP = 0.2; 
    
            // On vérifie la différence entre la cible actuelle et la dernière vibration
            if (Math.abs(gearTarget.current - lastGearHapticRotation.current) >= GEAR_NOTCH_STEP) {
                Haptics.selectionAsync(); // <--- Le "Tic" mécanique
                lastGearHapticRotation.current = gearTarget.current;
            }
            
            const hit = state.raycaster.ray.intersectPlane(gearPlane.current, intersection.current);
            if (hit) {
                const currentY = intersection.current.y;
                const deltaY = currentY - gearStartY.current;

                const rotationSensitivity = 0.2;
                const deltaRotation = deltaY * rotationSensitivity;
                
                gearTarget.current += deltaRotation;
                gearAccum.current += deltaRotation;
                gearStartY.current = currentY;
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
            console.log("Year changed to:", years[yearIndex.current]);
        }

        if (dragging1.current && cursor1.current && plane1.current) {
            const pos = getLocalPosition(cursor1.current, plane1.current);
            if (pos) {
                const min = -1.9, max = 3.2;
                const val = THREE.MathUtils.mapLinear(Math.max(min, Math.min(max, pos.x - dragOffset.current.x)), min, max, 0, 100);
                
                const HAPTIC_STEP = 5; 
        
                if (Math.abs(val - lastCursorHapticValue.current) >= HAPTIC_STEP) {
                    Haptics.selectionAsync();
                    lastCursorHapticValue.current = val;
                }
                
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
                const val = THREE.MathUtils.mapLinear(Math.max(min, Math.min(max, pos.y - dragOffset.current.y)), min, max, 100, 0);
                
                const HAPTIC_STEP = 5; 
        
                if (Math.abs(val - lastCursorHapticValue.current) >= HAPTIC_STEP) {
                    Haptics.selectionAsync();
                    lastCursorHapticValue.current = val;
                }
                
                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    onProductsChange(val);
                    lastProducts.current = val;
                    lastCallTime.current = now;
                }
                cursor5.current.position.y = THREE.MathUtils.mapLinear(val, 0, 100, max, min);
            }
        }

        if (dragging8.current && cursor8.current && plane8.current) {
            const pos = getLocalPosition(cursor8.current, plane8.current);
            if (pos) {
                const min = -2.2, max = 5.7;
                const val = THREE.MathUtils.mapLinear(Math.max(min, Math.min(max, pos.x - dragOffset.current.x)), max, min, 0, 100);
                
                const HAPTIC_STEP = 5; 
        
                if (Math.abs(val - lastCursorHapticValue.current) >= HAPTIC_STEP) {
                    Haptics.selectionAsync();
                    lastCursorHapticValue.current = val;
                }

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
            <primitive object={gltf.scene} scale={2} position={[0, 0, 0]} />
        </group>
    );
});
