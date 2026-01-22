import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber/native";
import { useGLTF } from "@react-three/drei";
import { Asset } from "expo-asset";
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';

const audioClick = require('../../assets/audio/click.wav');
const audioRotate = require('../../assets/audio/rotate.wav');
const audioGear = require('../../assets/audio/gear.wav');
const audioSlider = require('../../assets/audio/slider.wav');

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
    onCameraMovement,
    onYearChange,
    onResetClick,
}: ModelProps) {
    const asset = Asset.fromModule(require("../../assets/3d/configurator.glb"));
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
    const button2Stickers = useRef<Record<string, THREE.Object3D | null>>({});

    const button3 = useRef<Record<string, THREE.Object3D | null>>({});
    const button4 = useRef<Record<string, THREE.Object3D | null>>({});
    const button6 = useRef<Record<string, THREE.Object3D | null>>({});
    const button6Stickers = useRef<Record<string, THREE.Object3D | null>>({});

    const button7 = useRef<Record<string, THREE.Object3D | null>>({});

    
    // Refs pour le bouton 3
    const draggingButton3 = useRef(false);
    const button3StartAngle = useRef(0);
    const button3CurrentRotation = useRef(0);
    const button3Plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
    const lastButton3HapticPosition = useRef(0);

    // Refs pour le bouton 7
    const draggingButton7 = useRef(false);
    const button7StartAngle = useRef(0);
    const button7CurrentRotation = useRef(0);
    const button7Plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
    const lastButton7HapticPosition = useRef(0);



    const spots = useRef<Record<string, THREE.Object3D | null>>({});
    const spotsStickers = useRef<Record<string, THREE.Object3D | null>>({});

    const reset = useRef<Record<string, THREE.Object3D | null>>({});
    const resetSticker = useRef<Record<string, THREE.Object3D | null>>({});

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

        draggingButton3.current = false;
        draggingButton7.current = false;
        button3CurrentRotation.current = 0;
        button7CurrentRotation.current = 0;

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

    const player = useAudioPlayer(audioClick);
    const playSound = useCallback(() => {
        player.seekTo(0);
        player.play();
    }, [player]);

    
    const playerRotate = useAudioPlayer(audioRotate);
    const playRotate = useCallback(() => {
        playerRotate.seekTo(0);
        playerRotate.play();
    }, [playerRotate]);

    const playerGear = useAudioPlayer(audioGear);
    const playGear = useCallback(() => {
        playerGear.seekTo(0);
        playerGear.play();
    }, [playerGear]);

    const playerSlider = useAudioPlayer(audioSlider);
    const playSlider = useCallback(() => {
        playerSlider.seekTo(0);
        playerSlider.play();
    }, [playerSlider]);



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
            if (["stick2a", "stick2b", "stick2c"].includes(child.name)) {
                button2Stickers.current[child.name] = child;
                child.raycast = () => null;
                child.position.z += 0.001;

                const mat = child.material as THREE.MeshStandardMaterial;
                mat.depthWrite = false;
                mat.depthTest = true;

                if (mat.map) {
                    mat.map.minFilter = THREE.LinearFilter;
                    mat.map.magFilter = THREE.LinearFilter;
                    mat.map.generateMipmaps = false;
                    mat.map.needsUpdate = true;
                }

                mat.polygonOffset = true;
                mat.polygonOffsetFactor = -1;
                mat.polygonOffsetUnits = -1;
            }


            if (["2a", "2b", "2c"].includes(child.name)) {
                button2.current[child.name] = child;
                child.userData.initialZ = child.position.z;
            }
            if (child.name === "3") {
                button3.current[child.name] = child;
                child.userData.initial = child.rotation.y;

                const p = new THREE.Vector3();
                child.getWorldPosition(p);
                button3Plane.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -p.z);
            }
            if (child.name === "4") {
                button4.current[child.name] = child;
                child.userData.initial = child.rotation.z;
            }

            if (["stick6a", "stick6b"].includes(child.name)) {
                button6Stickers.current[child.name] = child;
                child.raycast = () => null;
                child.position.z += 0.001;

                const mat = child.material as THREE.MeshStandardMaterial;
                mat.depthWrite = false;
                mat.depthTest = true;

                if (mat.map) {
                    mat.map.minFilter = THREE.LinearFilter;
                    mat.map.magFilter = THREE.LinearFilter;
                    mat.map.generateMipmaps = false;
                    mat.map.needsUpdate = true;
                }

                mat.polygonOffset = true;
                mat.polygonOffsetFactor = -1;
                mat.polygonOffsetUnits = -1;
            }

            if (["6a", "6b"].includes(child.name)) {
                button6.current[child.name] = child;
                child.userData.initialZ = child.position.z;
            }
            if (child.name === "7") {
                button7.current[child.name] = child;
                child.userData.initial = child.rotation.y;

                const p = new THREE.Vector3();
                child.getWorldPosition(p);
                button7Plane.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -p.z);
            }
            if (["spot1", "spot2", "spot3"].includes(child.name)) {
                spots.current[child.name] = child;
                child.userData.initialZ = child.position.z;
            }
            if (["stickzspot1", "stickzspot2", "stickzspot3"].includes(child.name)) {
                spotsStickers.current[child.name] = child;
                child.userData.initialZ = child.position.z;
                child.raycast = () => null;
                child.position.z += 0.001;

                const mat = child.material as THREE.MeshStandardMaterial;
                mat.depthWrite = false;
                mat.depthTest = true;

                if (mat.map) {
                    mat.map.minFilter = THREE.LinearFilter;
                    mat.map.magFilter = THREE.LinearFilter;
                    mat.map.generateMipmaps = false;
                    mat.map.needsUpdate = true;
                }

                mat.polygonOffset = true;
                mat.polygonOffsetFactor = -1;
                mat.polygonOffsetUnits = -1;
            }
            if (child.name === "reset") {
                reset.current[child.name] = child;
                child.userData.initialZ = child.position.z;

                resetAnim.current[child.name] = { progress: 0, active: false };
            }
            if (["stickreset"].includes(child.name)) {
                resetSticker.current[child.name] = child;
                child.raycast = () => null;
                child.position.z += 0.001;

                const mat = child.material as THREE.MeshStandardMaterial;
                mat.depthWrite = false;
                mat.depthTest = true;

                if (mat.map) {
                    mat.map.minFilter = THREE.LinearFilter;
                    mat.map.magFilter = THREE.LinearFilter;
                    mat.map.generateMipmaps = false;
                    mat.map.needsUpdate = true;
                }

                mat.polygonOffset = true;
                mat.polygonOffsetFactor = -1;
                mat.polygonOffsetUnits = -1;
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

            const sticker = button2Stickers.current[`stick${k}`];
            if (sticker) {
                sticker.position.z = THREE.MathUtils.lerp(
                    sticker.position.z,
                    z,
                    0.5
                );
            }
        });
        

        Object.values(button3.current).forEach((b: any) => {
            const i = promptIA === 50 ? 0 : promptIA === 0 ? 1 : 2;
            b.rotation.y = THREE.MathUtils.lerp(b.rotation.y, b.userData.initial + [0, -0.9, 0.9][i], 0.2);
        });

        Object.values(button4.current).forEach((b: any) => {
            const z = meat === 0 ? b.userData.initial - 0.5 : b.userData.initial;
            b.rotation.z = THREE.MathUtils.lerp(b.rotation.z, z, 0.2);
        });

        Object.entries(button6.current).forEach(([k, b]) => {
            if (!b) return;
            const z = pressed6.current === k ? b.userData.initialZ - 0.2 : b.userData.initialZ;
            b.position.z = THREE.MathUtils.lerp(b.position.z, z, 0.5);

            const sticker = button6Stickers.current[`stick${k}`];
            if (sticker) {
                sticker.position.z = THREE.MathUtils.lerp(
                    sticker.position.z,
                    z,
                    0.5
                );
            }
        });

        Object.values(button7.current).forEach((b: any) => {
            if (!b) return;
            const i = energy === 100 ? 0 : energy === 0 ? 1 : energy === 66 ? 2 : 3;
            b.rotation.y = THREE.MathUtils.lerp(b.rotation.y, b.userData.initial + [0, 1.57, -1.57, -3.14][i], 0.2);
        });

        Object.entries(spots.current).forEach(([k, b]) => {
            if (!b) return;
            const z = pressedSpot.current === k ? b.userData.initialZ + 0.3 : b.userData.initialZ;
            b.position.z = THREE.MathUtils.lerp(b.position.z, z, 0.2);

            const sticker = spotsStickers.current[`stickz${k}`];
            if (sticker) {
                sticker.position.z = THREE.MathUtils.lerp(
                    sticker.position.z,
                    sticker.userData.initialZ + (z - b.userData.initialZ),
                    0.2
                );
            }
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
            playSlider();
            dragging1.current = true;
            lastCursorHapticValue.current = plane;
            setupDrag(cursor1.current, plane1.current);
        }
        if (name === "5" && cursor5.current && plane5.current) {
            playSlider();
            dragging5.current = true;
            lastCursorHapticValue.current = products;
            setupDrag(cursor5.current, plane5.current);
        }
        if (name === "8" && cursor8.current && plane8.current) {
            playSlider();
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
            playSound();
            const key = name as "2a" | "2b" | "2c";
            pressed2.current = key;
            onTransportChange(transportsBtn[key]);
        }

        if (name === "3") {
            triggerHaptic();
            playRotate();
            draggingButton3.current = true;
            lastButton3HapticPosition.current = promptIA;
            
            const button = button3.current["3"];
            if (button && e.ray.intersectPlane(button3Plane.current, intersection.current)) {
                const buttonPos = new THREE.Vector3();
                button.getWorldPosition(buttonPos);
                
                const dx = intersection.current.x - buttonPos.x;
                const dy = intersection.current.y - buttonPos.y;
                button3StartAngle.current = Math.atan2(dy, dx);
                button3CurrentRotation.current = button.rotation.y;
            }
        }

        if (name === "4") { triggerHaptic(); onMeatChange(); playSound();}
        if (["6a", "6b"].includes(name)) { 
            triggerHaptic();
            playSound();
            pressed6.current = name; 
            onPhoneChange(name === "6a" ? 100 : 0);  
        }
        
        if (name === "7") {
            triggerHaptic();
            playRotate();
            draggingButton7.current = true;
            lastButton7HapticPosition.current = energy;
            
            const button = button7.current["7"];
            if (button && e.ray.intersectPlane(button7Plane.current, intersection.current)) {
                const buttonPos = new THREE.Vector3();
                button.getWorldPosition(buttonPos);
                
                const dx = intersection.current.x - buttonPos.x;
                const dy = intersection.current.y - buttonPos.y;
                button7StartAngle.current = Math.atan2(dy, dx);
                button7CurrentRotation.current = button.rotation.y;
            }
        }

        const spotMap: Record<"spot1" | "spot2" | "spot3", number> = {
            "spot1": 1,
            "spot2": 2,
            "spot3": 3,
        };

        if (["spot1", "spot2", "spot3"].includes(name)) {
            triggerHaptic();
            playSound();
            pressedSpot.current = name;
            onCameraMovement("CAMERA_SPOT", spotMap[name as "spot1" | "spot2" | "spot3"]);
        }
        if (name === "reset") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            playSound();
            const anim = resetAnim.current[name];
            if (anim) {
                anim.active = true;
                anim.progress = 0;
            }
            resetScene();
            onResetClick();
        }
        if (name === "gear-real" && isGearActive.current) {
            playGear();
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
    }, [onTransportChange, onPromptIAChange, onMeatChange, onPhoneChange, onEnergyChange, onCameraMovement, onResetClick, playSound]);


    const onPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
        (e.target as Element).releasePointerCapture(e.pointerId);

        if (draggingButton3.current) {
            const button = button3.current["3"];
            if (button) {
                const initialRotation = button.userData.initial;
                const positions = [
                    initialRotation,
                    initialRotation - 0.9, 
                    initialRotation + 0.9 
                ];
                
                let closestIndex = 0;
                let minDiff = Math.abs(button.rotation.y - positions[0]);
                
                for (let i = 1; i < positions.length; i++) {
                    const diff = Math.abs(button.rotation.y - positions[i]);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestIndex = i;
                    }
                }
                
                const values: Array<0 | 50 | 100> = [50, 0, 100];
                const targetValue = values[closestIndex];
                if (targetValue !== promptIA) {
                    onPromptIAChange();
                }
                
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        }
        
        if (draggingButton7.current) {
            const button = button7.current["7"];
            if (button) {
                const initialRotation = button.userData.initial;
                const positions = [
                    initialRotation,           // 100 (bas)
                    initialRotation + 1.57,    // 0 (gauche)
                    initialRotation - 1.57,    // 66 (droite)
                    initialRotation - 3.14     // 33 (haut)
                ];
                
                let closestIndex = 0;
                let minDiff = Math.abs(button.rotation.y - positions[0]);
                
                for (let i = 1; i < positions.length; i++) {
                    const diff = Math.abs(button.rotation.y - positions[i]);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestIndex = i;
                    }
                }
            
                const values: Array<0 | 33 | 66 | 100> = [100, 0, 66, 33];
                const targetValue = values[closestIndex];
                if (targetValue !== energy) {
                    onEnergyChange();
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        }

        dragging1.current = false;
        draggingButton3.current = false;
        dragging5.current = false;
        draggingButton7.current = false;
        dragging8.current = false;
        draggingGear.current = false;
    }, [onPromptIAChange, onEnergyChange, promptIA, energy]);


    const gearPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));

    useFrame((state) => {
        if (draggingButton3.current) {
            const button = button3.current["3"];
            if (button && state.raycaster.ray.intersectPlane(button3Plane.current, intersection.current)) {
                const buttonPos = new THREE.Vector3();
                button.getWorldPosition(buttonPos);
                
                const dx = intersection.current.x - buttonPos.x;
                const dy = intersection.current.y - buttonPos.y;
                const currentAngle = Math.atan2(dy, dx);
                
                let deltaAngle = currentAngle - button3StartAngle.current;
                
                while (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
                while (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
                
                button.rotation.y = button3CurrentRotation.current + deltaAngle;
                
                const initialRotation = button.userData.initial;
                const positions = [
                    initialRotation,
                    initialRotation, 
                    initialRotation - 0.9,
                    initialRotation + 0.9
                ];
                
                let closestIndex = 0;
                let minDiff = Math.abs(button.rotation.y - positions[0]);
                
                for (let i = 1; i < positions.length; i++) {
                    const diff = Math.abs(button.rotation.y - positions[i]);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestIndex = i;
                    }
                }
                
                const values: Array<0 | 50 | 100> = [50, 0, 100];
                const newValue = values[closestIndex];
                if (newValue !== lastButton3HapticPosition.current) {
                    Haptics.selectionAsync();
                    lastButton3HapticPosition.current = newValue;
                }
            }
        }
    
        // Gestion du bouton 7 rotatif - LE BOUTON SUIT LE DOIGT
        if (draggingButton7.current) {
            const button = button7.current["7"];
            if (button && state.raycaster.ray.intersectPlane(button7Plane.current, intersection.current)) {
                const buttonPos = new THREE.Vector3();
                button.getWorldPosition(buttonPos);
                
                const dx = intersection.current.x - buttonPos.x;
                const dy = intersection.current.y - buttonPos.y;
                const currentAngle = Math.atan2(dy, dx);
                
                let deltaAngle = currentAngle - button7StartAngle.current;
                
                // Normaliser l'angle entre -PI et PI
                while (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
                while (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
                
                // NOUVEAU: Le bouton suit directement le doigt
                button.rotation.y = button7CurrentRotation.current + deltaAngle;
                
                // Déterminer la position la plus proche pour le feedback haptique
                const initialRotation = button.userData.initial;
                const positions = [
                    initialRotation,           // 100 (bas)
                    initialRotation + 1.57,    // 0 (gauche)
                    initialRotation - 1.57,    // 66 (droite)
                    initialRotation - 3.14     // 33 (haut)
                ];
                
                let closestIndex = 0;
                let minDiff = Math.abs(button.rotation.y - positions[0]);
                
                for (let i = 1; i < positions.length; i++) {
                    const diff = Math.abs(button.rotation.y - positions[i]);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestIndex = i;
                    }
                }
                
                const values: Array<0 | 33 | 66 | 100> = [100, 0, 66, 33];
                const newValue = values[closestIndex];
                
                // Feedback haptique quand on passe près d'une position
                if (newValue !== lastButton7HapticPosition.current) {
                    Haptics.selectionAsync();
                    lastButton7HapticPosition.current = newValue;
                }
            }
        }
    });



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
