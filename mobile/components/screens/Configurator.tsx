import React, { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import * as THREE from "three";
import {  Socket } from "socket.io-client";
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei';
import { Asset } from 'expo-asset';


// Sensor 
import { Accelerometer } from 'expo-sensors';
import type { EventSubscription } from 'expo-modules-core';


type Props = {
    userName: string;
    roomId: string;
    socket: Socket | null;
};







const { width, height } = Dimensions.get("window");

const cameraPositions = [
    new THREE.Vector3(-14, 8, 26),
    new THREE.Vector3(2, -4, 32),
    new THREE.Vector3(-5, 5, 25),
    new THREE.Vector3(-16, 3, 19),
    new THREE.Vector3(-16, -14, 28),
    new THREE.Vector3(-7, -12, 25),
    new THREE.Vector3(12, -13, 19),
    new THREE.Vector3(10, -30, 32),
    new THREE.Vector3(32, -5, 45),
];

const cameraRotation = [
    new THREE.Vector3(0, 0, -1.55),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 1.55),
    new THREE.Vector3(0, 0, 0),
];

const cameraLookAt = [
    new THREE.Vector3(-4, 14, 2),
    new THREE.Vector3(8.5, 6.5, 0),
    new THREE.Vector3(-1, 7, 0),
    new THREE.Vector3(-10, 8, 0),
    new THREE.Vector3(-10, -4, 0),
    new THREE.Vector3(-1, -6, 0),
    new THREE.Vector3(8, -7, 0),
    new THREE.Vector3(1, -14, 0),
    new THREE.Vector3(0, -3, 0),
];

// CAMERA
function CameraController({ index }: { index: number }) {
    const { camera } = useThree();
    const currentLookAt = useRef(new THREE.Vector3());
    const currentRoll = useRef(0);

    useFrame(() => {
        currentLookAt.current.lerp(cameraLookAt[index], 0.1);
        camera.position.lerp(cameraPositions[index], 0.1);
        camera.lookAt(currentLookAt.current);

        const targetRoll = cameraRotation[index].z;
        currentRoll.current = THREE.MathUtils.lerp(currentRoll.current, targetRoll, 0.1);
        camera.rotateZ(currentRoll.current);
    })
    return null
}



// FPS 
function FPSCounter({ onFpsUpdate }: { onFpsUpdate: (fps: number) => void }) {
    const frameCount = useRef(0);
    const lastTime = useRef(Date.now());
    useFrame(() => {
        frameCount.current++;
        const currentTime = Date.now();
        if (currentTime >= lastTime.current + 1000) {
            onFpsUpdate(frameCount.current);
            frameCount.current = 0;
            lastTime.current = currentTime;
        }
    });
    return null;
}




type ModelProps = {
    goToStep: (stepIndex: number) => void;
    plane: number;
    onPlaneChange: (value: number) => void;
    transport: any;
    onTransportChange: (value: any) => void;
    promptIA: number;
    onPromptIAChange: () => void;
    meat: boolean;
    onMeatChange: () => void;
    products: number;
    onProductsChange: (value: number) => void;
    phone: any;
    onPhoneChange: (value: any) => void;
    energy: number;
    onEnergyChange: () => void;
    clothes: number;
    onClothesChange: (value: number) => void;
    isModelTurned: boolean;
    resultIsShown: boolean;
    onReveal: (overrides?: any) => void; // REVEAL
    onCameraMovement: (type: string, value: number) => void; //movements
    onYearChange: (value: number) => void; // year changement

};






function ModelComponent({ 
    plane, onPlaneChange, 
    onTransportChange, 
    promptIA, onPromptIAChange, 
    meat, onMeatChange, 
    products, onProductsChange, 
    phone, onPhoneChange, 
    energy, onEnergyChange, 
    clothes, onClothesChange, 
    isModelTurned,
    resultIsShown,
    onReveal,
    onCameraMovement,
    onYearChange,
}: ModelProps) {
    const asset = Asset.fromModule(require("../../assets/3d/configurateur.glb"));
    if (!asset.localUri) asset.downloadAsync();

    const gltf = useGLTF(asset.localUri || asset.uri) as any;

    const dragging1 = useRef(false);
    const dragging5 = useRef(false);
    const dragging8 = useRef(false);
    const draggingMovements = useRef(false);

    const cursorRef = useRef<THREE.Object3D | null>(null);
    const planeRef = useRef<THREE.Plane | null>(null);
    const cursor5Ref = useRef<THREE.Object3D | null>(null);
    const plane5Ref = useRef<THREE.Plane | null>(null);
    const cursor8Ref = useRef<THREE.Object3D | null>(null);
    const plane8Ref = useRef<THREE.Plane | null>(null);
    const cursorMovementsRef = useRef<THREE.Object3D | null>(null);
    const planeMovementsRef = useRef<THREE.Plane | null>(null);

    const draggingGear = useRef(false);
    const gearStartY = useRef(0);
    const gearTargetRotation = useRef(0);
    const gearCurrentRotation = useRef(0);

    const intersectionPoint = useRef(new THREE.Vector3());
    const localPoint = useRef(new THREE.Vector3());
    const dragOffset = useRef(new THREE.Vector3());
    const groupRef = useRef<THREE.Group>(null);

    const lastCallTime = useRef(0);
    const lastValue1 = useRef(plane);
    const lastValue5 = useRef(products);
    const lastValue8 = useRef(clothes);


    useEffect(() => { lastValue1.current = plane; }, [plane]);
    useEffect(() => { lastValue5.current = products; }, [products]);
    useEffect(() => { lastValue8.current = clothes; }, [clothes]);

    const pressed2Button = useRef<string | null>(null);
    const button2Refs = useRef<{ [key: string]: THREE.Object3D | null }>({ "2a": null, "2b": null, "2c": null });
    const pressed3Button = useRef<string | null>(null);
    const button3Refs = useRef<{ [key: string]: THREE.Object3D | null }>({});
    const pressed4Button = useRef<string | null>(null);
    const button4Refs = useRef<{ [key: string]: THREE.Object3D | null }>({});
    const pressed6Button = useRef<string | null>(null);
    const button6Refs = useRef<{ [key: string]: THREE.Object3D | null }>({ "6a": null, "6b": null });
    const pressed7Button = useRef<string | null>(null);
    const button7Refs = useRef<{ [key: string]: THREE.Object3D | null }>({});
    
    const pressedSpotButton = useRef<string | null>(null);
    const buttonSpotRefs = useRef<{ [key: string]: THREE.Object3D | null }>({ "spot-1": null, "spot-2": null, "spot-3": null });

    const realGearRef = useRef<THREE.Object3D | null>(null);
    const fakeGearRef = useRef<THREE.Object3D | null>(null);


    const years = useRef([2025, 2050, 2075, 2100]);
    const currentYearIndex = useRef(0);
    const gearRotationAccumulator = useRef(0);


    useEffect(() => {
        if (!gltf?.scene) return;
        gltf.scene.traverse((child: any) => {
            if (child.isMesh) {
                child.userData = { name: child.name };
                const worldPos = new THREE.Vector3();

                if (child.name === "gear-real") {
                    child.visible = false;
                    child.raycast = () => null;
                    realGearRef.current = child;
                }
                if (child.name === "gear-fake") {
                    child.visible = true;
                    fakeGearRef.current = child;
                }

                
                if (child.name === "1") {
                    cursorRef.current = child;
                    child.getWorldPosition(worldPos);
                    planeRef.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -worldPos.z);
                } else if (child.name === "5") {
                    cursor5Ref.current = child;
                    child.getWorldPosition(worldPos);
                    plane5Ref.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -worldPos.z);
                } else if (child.name === "8") {
                    cursor8Ref.current = child;
                    child.getWorldPosition(worldPos);
                    plane8Ref.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), -worldPos.z);
                } 
                else if (["2a", "2b", "2c"].includes(child.name)) {
                    button2Refs.current[child.name] = child;
                    child.userData.initialZ = child.position.z;
                } else if (child.name === "3") {
                    button3Refs.current[child.name] = child;
                    child.userData.initialRotate = child.rotation.y;
                } else if (child.name === "4") {
                    button4Refs.current[child.name] = child;
                    child.userData.initialRotate = child.rotation.z;
                } else if (["6a", "6b"].includes(child.name)) {
                    button6Refs.current[child.name] = child;
                    child.userData.initialZ = child.position.z;
                } else if (child.name === "77") {
                    button7Refs.current[child.name] = child;
                    child.userData.initialRotate = child.rotation.y;
                }


                // spots de camera
                else if (["spot-1", "spot-2", "spot-3"].includes(child.name)) {
                    buttonSpotRefs.current[child.name] = child;
                    child.userData.initialZ = child.position.z;
                }
            }
        });
    }, [gltf]);


    // cacher la roue cranté
    useEffect(() => {
        if (isModelTurned) {
            setTimeout(() => {
                if (realGearRef.current) {
                    realGearRef.current.visible = true;
                    realGearRef.current.raycast = THREE.Mesh.prototype.raycast;
                }
                if (fakeGearRef.current) {
                    fakeGearRef.current.visible = false;
                }
            }, 1000);
        } else {
            if (realGearRef.current) realGearRef.current.visible = false;
            if (fakeGearRef.current) fakeGearRef.current.visible = true;
        }
    }, [isModelTurned]);

    const STEP_ROTATION = Math.PI / 0.5;

    useFrame(() => {
        if (groupRef.current) {
            const targetY = isModelTurned ? -2.5 : 0;
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.03);
        }

        Object.entries(button2Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const targetZ = (pressed2Button.current === name) ? ref.userData.initialZ - 0.3 : ref.userData.initialZ;
            ref.position.z = THREE.MathUtils.lerp(ref.position.z, targetZ, 0.2);
        });

        Object.entries(button3Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const index = promptIA === 0 ? 0 : promptIA === 33 ? 1 : promptIA === 66 ? 2 : 3;
            const targetY = ref.userData.initialRotate - [0, -1.5, -3, -5][index];
            ref.rotation.y = THREE.MathUtils.lerp(ref.rotation.y, targetY, 0.05);
        });

        Object.entries(button4Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const targetZ = meat ? ref.userData.initialRotate - 0.5 : ref.userData.initialRotate;
            ref.rotation.z = THREE.MathUtils.lerp(ref.rotation.z, targetZ, 0.2);
        });

        Object.entries(button6Refs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const targetZ = (pressed6Button.current === name) ? ref.userData.initialZ - 0.2 : ref.userData.initialZ;
            ref.position.z = THREE.MathUtils.lerp(ref.position.z, targetZ, 0.2);
        });

        Object.entries(button7Refs.current).forEach(([name, ref]) => {
            console.log("button7Refs:", button7Refs.current);
            if (!ref) return;
            const index = energy === 0 ? 0 : energy === 33 ? 1 : energy === 66 ? 2 : 3;
            const targetY = ref.userData.initialRotate - [0, 1.7, 3.4, 5][index];
            ref.rotation.y = THREE.MathUtils.lerp(ref.rotation.y, targetY, 0.05);
        }); 


        Object.entries(buttonSpotRefs.current).forEach(([name, ref]) => {
            if (!ref) return;
            const targetZ = (pressedSpotButton.current === name) ? ref.userData.initialZ - 0.3 : ref.userData.initialZ;
            ref.position.z = THREE.MathUtils.lerp(ref.position.z, targetZ, 0.2);
        });
    });

    const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();

        const clicked = e.object as THREE.Object3D & { userData?: { name?: string } };
        const name = clicked?.userData?.name;
        if (!name) return;

        (e.target as Element).setPointerCapture(e.pointerId);

        const setupDrag = (cursor: THREE.Object3D, plane: THREE.Plane) => {
            e.stopPropagation();
            if (e.ray.intersectPlane(plane, intersectionPoint.current)) {
                if (cursor.parent) {
                    localPoint.current.copy(intersectionPoint.current);
                    cursor.parent.worldToLocal(localPoint.current);
                    dragOffset.current.set(
                        localPoint.current.x - cursor.position.x,
                        localPoint.current.y - cursor.position.y,
                        0
                    );
                }
            }
        };

        if (name === "1" && cursorRef.current && planeRef.current) {
            dragging1.current = true;
            setupDrag(cursorRef.current, planeRef.current);
        } else if (name === "5" && cursor5Ref.current && plane5Ref.current) {
            dragging5.current = true;
            setupDrag(cursor5Ref.current, plane5Ref.current);
        } else if (name === "8" && cursor8Ref.current && plane8Ref.current) {
            dragging8.current = true;
            setupDrag(cursor8Ref.current, plane8Ref.current);
        } 
        else if (["2a", "2b", "2c"].includes(name)) {
            pressed2Button.current = name;
            const mapping: any = { "2a": "100", "2b": "50", "2c": "0" }; // voiture, bus, pied
            const newTransport = mapping[name];
            onTransportChange({ transport: newTransport });
            onReveal(); // Envoyer REVEAL
            console.log(newTransport);
        } else if (name === "3") {
            pressed3Button.current = name;
            const newPromptIA = promptIA === 0 ? 33 : promptIA === 33 ? 66 : promptIA === 66 ? 100 : 0;
            onPromptIAChange();
            onReveal({ promptIA: newPromptIA });
            console.log(newPromptIA);
        } else if (name === "4") {
            pressed4Button.current = name;
            const newMeat = !meat;
            onMeatChange();
            onReveal({ meat: newMeat });
            console.log(newMeat);
        } else if (["6a", "6b"].includes(name)) {
            pressed6Button.current = name;
            const mapping: any = { "6a": 100, "6b": 0 }; // Iphone 17 ou Nokia
            const newPhone = mapping[name];
            onPhoneChange(newPhone);
            onReveal({ phone: newPhone });
            console.log(newPhone);
        } else if (name === "77") {
            pressed7Button.current = name;
            const newEnergy = energy === 0 ? 33 : energy === 33 ? 66 : energy === 66 ? 100 : 0;
            onEnergyChange();
            onReveal({ energy: newEnergy });
            console.log(newEnergy);
        } else if (["spot-1", "spot-2", "spot-3"].includes(name)) {
            pressedSpotButton.current = name;
            const mapping: any = { "spot-1": 1, "spot-2": 2, "spot-3": 3 };
            const newSpot = mapping[name];
            onCameraMovement("CAMERA_SPOT", newSpot);
            console.log("spot pressed", newSpot);
        } else if (name === "gear-real" && realGearRef.current) {
            draggingGear.current = true;

            const intersects = e.intersections;
            if (intersects.length > 0) {
                gearStartY.current = intersects[0].point.y;
            }

        }
    }, [onTransportChange, onPromptIAChange, onMeatChange, onPhoneChange, onEnergyChange, onReveal, onCameraMovement, promptIA, meat, energy]);

    useFrame((state) => {
        if (!dragging1.current && !dragging5.current && !dragging8.current && !draggingMovements.current && !draggingGear.current) return;

        const now = Date.now();
        const THROTTLE_DELAY = 50; 

        state.raycaster.setFromCamera(state.pointer, state.camera);

        const getLocalPosition = (cursor: THREE.Object3D, plane: THREE.Plane) => {
            if (state.raycaster.ray.intersectPlane(plane, intersectionPoint.current)) {
                if (cursor.parent) {
                    localPoint.current.copy(intersectionPoint.current);
                    cursor.parent.worldToLocal(localPoint.current);
                    return localPoint.current;
                }
            }
            return null;
        };

        // GEAR ROTATION
        if (draggingGear.current && realGearRef.current) {
            const intersects = state.raycaster.intersectObject(realGearRef.current, false);
            if (intersects.length > 0) {
                const currentY = intersects[0].point.y;
                const deltaY = currentY - gearStartY.current;

                const rotationSpeed = 2;
                const deltaRotation = deltaY * rotationSpeed;

                gearTargetRotation.current += deltaRotation;
                gearRotationAccumulator.current += deltaRotation;

                gearStartY.current = currentY;
            }
        }


        if (realGearRef.current) {
            gearCurrentRotation.current = THREE.MathUtils.lerp(
                gearCurrentRotation.current,
                gearTargetRotation.current,
                0.1 
            );

            realGearRef.current.rotation.x = gearCurrentRotation.current;
        }
        if (Math.abs(gearRotationAccumulator.current) >= STEP_ROTATION) {
            const direction = Math.sign(gearRotationAccumulator.current);

            currentYearIndex.current = THREE.MathUtils.clamp(
                currentYearIndex.current + direction,
                0,
                years.current.length - 1
            );

            onYearChange(years.current[currentYearIndex.current]);

            // On consomme un cran
            gearRotationAccumulator.current -= STEP_ROTATION * direction;
        }


        if (dragging1.current && cursorRef.current && planeRef.current) {
            const pos = getLocalPosition(cursorRef.current, planeRef.current);
            if (pos) {
                const min = -1.9, max = 3.2;
                let newX = Math.max(min, Math.min(max, pos.x - dragOffset.current.x));
                
                cursorRef.current.position.x = newX;

                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    const val = THREE.MathUtils.mapLinear(newX, min, max, 0, 100);
                    onPlaneChange(val);
                    lastValue1.current = val;
                    lastCallTime.current = now;
                }
            }
        }

        if (dragging5.current && cursor5Ref.current && plane5Ref.current) {
            const pos = getLocalPosition(cursor5Ref.current, plane5Ref.current);
            if (pos) {
                const min = -4.6, max = -0.8;
                let newY = Math.max(min, Math.min(max, pos.y - dragOffset.current.y));

                cursor5Ref.current.position.y = newY;

                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    const val = THREE.MathUtils.mapLinear(newY, min, max, 0, 100);
                    onProductsChange(val);
                    lastValue5.current = val;
                    lastCallTime.current = now;
                }
            }
        }

        if (dragging8.current && cursor8Ref.current && plane8Ref.current) {
            const pos = getLocalPosition(cursor8Ref.current, plane8Ref.current);
            if (pos) {
                const min = -2.4, max = 6.8;
                let newX = Math.max(min, Math.min(max, pos.x - dragOffset.current.x));

                cursor8Ref.current.position.x = newX;
 
                if (now - lastCallTime.current > THROTTLE_DELAY) {
                    const val = THREE.MathUtils.mapLinear(newX, max, min, 0, 100);
                    onClothesChange(val);
                    lastValue8.current = val;
                    lastCallTime.current = now;
                }
            }
        }


    });

    const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
        (e.target as Element).releasePointerCapture(e.pointerId);
        
        if (dragging1.current) {
            dragging1.current = false;
            onPlaneChange(lastValue1.current);
            onReveal(); //REVEAL 
        }
        if (dragging5.current) {
            dragging5.current = false;
            onProductsChange(lastValue5.current);
            console.log(products);
            onReveal(); 
        }
        if (dragging8.current) {
            dragging8.current = false;
            onClothesChange(lastValue8.current);
            console.log(clothes);
            onReveal(); 
        }
        // if (draggingGear.current) {
        //     draggingGear.current = false;
        // }
    };

    return (
        <group
            ref={groupRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <primitive object={gltf.scene} scale={2} />
        </group>
    );
}

const Model = React.memo(ModelComponent);

// const SOCKET_URL = "http://172.20.10.4:4000/";

export default function App({ userName, roomId, socket }: Props) {
    const [isConnected, setIsConnected] = useState(false);
    const [plane, setPlane] = useState(10);
    const [transport, setTransport] = useState<"100" | "50" | "0" | 0>(0); // voiture:100 bus:50 pied:0
    const [promptIA, setPromptIA] = useState<0 | 33 | 66 | 100>(0);
    const [energy, setEnergy] = useState<0 | 33 | 66 | 100>(0);
    const [meat, setMeat] = useState(false);
    const [products, setProducts] = useState(5);
    const [phone, setPhone] = useState<"IPhone 17" | "Nokia 3310"| 0>(0);
    const [clothes, setClothes] = useState(5);

    const [fps, setFps] = useState(0);
    const [isModelTurned, setIsModelTurned] = useState(false);
    const [resultIsShown, setResultIsShown] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const steps = ["Avion", "Transport", "Prompt IA", "Viande", "Produits", "Téléphone", "Energie", "Vêtements"];
    const [camIndex, setCamIndex] = useState(0);

    // const socketRef = useRef<Socket | null>(null);

   
    // Gestion des écouteurs d'événements (Listeners)
    useEffect(() => {
        if (!socket) return;

        // Mise à jour de l'état connecté pour l'affichage UI
        setIsConnected(socket.connected);

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);
        const onUpdateClient = (data: any) => {
            console.log("📥 Mise à jour reçue:", data);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("update-client", onUpdateClient);

        // Pas besoin de emit('join-room') ici, c'est fait dans index.tsx

        return () => {
            // On nettoie juste les listeners, on ne disconnect PAS le socket
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("update-client", onUpdateClient);
        };
    }, [socket]); // Dépendance sur le socket reçu en props

    // envoyer REVEAL
    const sendReveal = useCallback((overrides = {}) => {
        if (!socket) return;

        const payload = {
            type: "REVEAL",
            ...overrides,
        };
        
        socket.emit("action-client", {
            roomId,
            payload
        });

        console.log("REVEAL envoyé", payload);
    }, [socket, roomId]);

    
    
    // envoyer VALIDATE_FORM
   // VALIDATE_FORM
    const sendValidateForm = useCallback(() => {
        if (!socket) return;

        socket.emit("action-client", {
            roomId,
            payload: {
                type: "VALIDATE_FORM",
                data: {
                    plane: Math.round(plane),
                    transport,
                    promptIA,
                    meat,
                    products: Math.round(products),
                    phone,
                    energy,
                    clothes: Math.round(clothes),
                },
            }
        });

        console.log("VALIDATE_FORM envoyé");
    }, [socket, roomId, plane, transport, promptIA, meat, products, phone, energy, clothes]);


    // envoyer camera movements
    const sendCameraMovement = useCallback((type: string, value: number) => {
        if (!socket) return;

        socket.emit("action-client", {
            roomId,
            payload: {
                type: type,
                data:{
                    strength: value,
                }
            }
        });

        console.log(`${type} envoyé:`, value);
        console.log(` movement:`, value);
    }, [socket, roomId]);


    const sendYearTarget = useCallback((value: number) => {
        if (!socket) return;

        socket.emit("action-client", {
            roomId,
            payload: {
                type: "YEARS",
                data:{
                    strength: value,
                }
            }
        });

        console.log(`target year:`, value);
    }, [socket, roomId]);




    // Handlers
    const handlePlaneChange = useCallback((v: number) => {
        setPlane(v);
    }, []);

    const handleTransportChange = useCallback((v: any) => {
        setTransport(v);
    }, []);

    const togglePromptIA = useCallback(() => {
        setPromptIA(prev => prev === 0 ? 33 : prev === 33 ? 66 : prev === 66 ? 100 : 0);
    }, []);

    const toggleMeat = useCallback(() => {
        setMeat(prev => !prev);
    }, []);

    const handleProductsChange = useCallback((v: number) => {
        setProducts(v);
    }, []);

    const handlePhoneChange = useCallback((v: any) => {
        setPhone(v);
    }, []);

    const toggleEnergy = useCallback(() => {
        setEnergy(prev => prev === 0 ? 33 : prev === 33 ? 66 : prev === 66 ? 100 : 0);
    }, [])

    const handleClothesChange = useCallback((v: number) => {
        setClothes(v);
    }, []);

    // Nav
    const nextStep = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
    const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
    const goToStep = useCallback((i: number) => setCurrentStep(i), []);
    
    const nextCam = () => setCamIndex(i => (i + 1) % cameraPositions.length);
    const prevCam = () => setCamIndex(i => (i - 1 + cameraPositions.length) % cameraPositions.length);

    const getQuestionText = () => {
        switch (currentStep) {
            case 0: return `À quelle Fréquence ${userName} prend l'avion ? ${Math.round(plane)}`;
            case 1: return `Comment ${userName} se déplace au quotidien ?`;
            case 2: return `À quelle Fréquence ${userName} utilise l'Intelligence Artificielle ? ${promptIA}`;
            case 3: return `${userName} mange beaucoup de viande ?`;
            case 4: return `${userName} mange local ? Ou ses produits ont fait 3x le tour du globe avant d'arriver dans son assiette ?`;
            case 5: return `${userName} s'équipe d'un IPhone 17, ou se contente d'un Nokia 3310 ?`;
            case 6: return `À quelle température ${userName} chauffe son logement ?`;
            case 7: return `À quelle Fréquence ${userName} achète des vêtements ? ${Math.round(clothes)}`;
            default: return "Configuration terminée";
        }
    };

    const handleFinish = () => {
        nextCam();
        nextStep();
        setIsModelTurned(true);
        sendValidateForm(); // VALIDATE_FORM
    };

    const handleResult = () => {
        setResultIsShown(true);
    };

    const closeResult = () => {
        setResultIsShown(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.fpsContainer}>
                <Text style={styles.fpsText}>FPS: {fps}</Text>
                <Text style={styles.fpsText}>{isConnected ? "WS Connecté" : "WS Déconnecté"}</Text>
            </View>

            {!isModelTurned && (
                <View style={styles.sliderContainer}>
                    <Text style={styles.label}>{getQuestionText()}</Text>
                </View>
            )}

            <Image
                source={require("../../assets/img/hero.png")}
                style={styles.image}
            />

            <View style={styles.canvas}>
                <Canvas camera={{ position: [0, 0, 15] }} onCreated={(state) => state.gl.setClearColor("#fff")}>
                    <FPSCounter onFpsUpdate={setFps} />
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[0, 20, 30]} intensity={2} />
                    
                    <Suspense fallback={null}>
                        <Model 
                            goToStep={goToStep} 
                            plane={plane} onPlaneChange={handlePlaneChange} 
                            transport={transport} onTransportChange={handleTransportChange}
                            meat={meat} onMeatChange={toggleMeat}
                            promptIA={promptIA} onPromptIAChange={togglePromptIA}
                            products={products} onProductsChange={handleProductsChange} 
                            phone={phone} onPhoneChange={handlePhoneChange}
                            energy={energy} onEnergyChange={toggleEnergy}
                            clothes={clothes} onClothesChange={handleClothesChange} 
                            isModelTurned={isModelTurned}
                            resultIsShown={resultIsShown}
                            onReveal={sendReveal} // passer le callback REVEAL
                            onCameraMovement={sendCameraMovement}
                            onYearChange={sendYearTarget}
                            // onGyroLook={sendGyroLook}
                        />
                    </Suspense>
                    <CameraController index={camIndex} />
                </Canvas>
            </View> 

            {!isModelTurned && (
                <View style={styles.buttons}>
                    {currentStep > 0 && (
                        <TouchableOpacity onPress={() => { prevCam(); prevStep(); setIsModelTurned(false) }} style={styles.button}>
                            <Text style={styles.buttonText}>←</Text>
                        </TouchableOpacity>
                    )}
                    {currentStep < steps.length - 1 && (
                        <TouchableOpacity onPress={() => { nextCam(); nextStep(); }} style={styles.button}>
                            <Text style={styles.buttonText}>→</Text>
                        </TouchableOpacity>
                    )}
                    {currentStep === steps.length - 1 && (
                        <TouchableOpacity onPress={handleFinish} style={styles.button}>
                            <Text style={styles.buttonText}>Terminer</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}


            {/* Result view */}
            {isModelTurned && (
                <View style={styles.buttons}>
                    {currentStep === steps.length - 1 && (
                        <TouchableOpacity onPress={handleResult} style={styles.button}>
                            <Text style={styles.buttonText}>Voir le résultat</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}


            {isModelTurned && resultIsShown && (
                <View style={styles.ResultsPanel}>

                    <TouchableOpacity onPress={closeResult} style={[styles.button, styles.buttonClose]}>
                        <Text style={styles.buttonText}>X</Text>
                    </TouchableOpacity>

                    
                
                    <TouchableOpacity onPress={handleResult} style={styles.button}>
                        <Text style={styles.buttonText}>Question 1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleResult} style={styles.button}>
                        <Text style={styles.buttonText}>Question 2</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleResult} style={styles.button}>
                        <Text style={styles.buttonText}>Question 3</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleResult} style={styles.button}>
                        <Text style={styles.buttonText}>Question 4</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleResult} style={styles.button}>
                        <Text style={styles.buttonText}>Question 5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleResult} style={styles.button}>
                        <Text style={styles.buttonText}>Question 6</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleResult} style={styles.button}>
                        <Text style={styles.buttonText}>Question 7</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleResult} style={styles.button}>
                        <Text style={styles.buttonText}>Question 8</Text>
                    </TouchableOpacity>

                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    canvas: {
        position: "absolute",
        width: width,
        height: height,
        top: 0,
        left: 0,
        zIndex: 0
    },
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
    },
    fpsContainer: {
        position: "absolute",
        top: 40,
        left: 20,
        zIndex: 10,
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 5,
        borderRadius: 5
    },
    fpsText: {
        color: "#fff",
        fontWeight: "bold"
    },
    sliderContainer: {
        width: "100%",
        marginVertical: 30,
        position: "absolute",
        top: 30,
        backgroundColor: "#FAFAF9",
        borderRadius: 24,
        padding: 24,
        paddingTop: 40,
        paddingBottom: 40, 

        zIndex: 1,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 4
    },
    image: {
        width: 250,
        height: 250,
        transform: [{ scale: -1 }],
        position: "absolute",
        top: -90,
        zIndex: 2,
        resizeMode: "contain",
        marginBottom: 10,
    }, 
    question: {
        color: "#000000",
        opacity: 0.5,
        fontSize: 10,
        fontWeight: "700",
        marginBottom: 10,
        textAlign: "center"
    },
    label: {
        color: "#000000",
        fontSize: 20,
        textAlign: "center",
        fontWeight: "700"
    },
    buttons: {
        flexDirection: "row",
        gap: 10,
        marginTop: 20,
        position: "absolute",
        bottom: 50,
        zIndex: 2
    },
    button: {
        backgroundColor: '#ffffff',
        paddingVertical: 24,
        paddingHorizontal: 27,
        borderRadius: 100,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 3.84
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000'
    },

    buttonClose: {
        position: "absolute",
        top: 20,
        margin : "auto",
        zIndex: 3,
    },
    ResultsPanel: {
        position: "absolute",
        top: 20,
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: "100%",
        padding: 20,
        backgroundColor: "rgba(152, 101, 101, 0.9)",
        zIndex: 2,
        flexDirection: "column",
        gap: 10,
    }
});



