import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber/native";
import * as THREE from "three";

const cameraPositions = [
    new THREE.Vector3(-14, 8, 26),
    new THREE.Vector3(2, -4, 32),
    new THREE.Vector3(-5, 5, 25),
    new THREE.Vector3(-16, 3, 19),
    new THREE.Vector3(-16, -14, 28),
    new THREE.Vector3(-7, -12, 25),
    new THREE.Vector3(12, -13, 19),
    new THREE.Vector3(10, -30, 32),
    new THREE.Vector3(38, -7, 22),
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
    new THREE.Vector3(0, -7, 0),
];

const cameraRotationZ = [
    -1.55,
    0,
    0,
    0,
    0,
    0,
    0,
    1.55,
    0,
];

type CameraControllerProps = {
    index: number;
};

export const CAMERA_COUNT = 9;


export function CameraController({ index }: CameraControllerProps) {
    const { camera } = useThree();

    const currentLookAt = useRef(new THREE.Vector3());
    const currentRoll = useRef(0);

    useFrame(() => {
        if ( !cameraPositions[index] || !cameraLookAt[index] || cameraRotationZ[index] === undefined) {
            return;
        }

        camera.position.lerp(cameraPositions[index], 0.1);
        currentLookAt.current.lerp(cameraLookAt[index], 0.1);
        camera.lookAt(currentLookAt.current);

        const targetRoll = cameraRotationZ[index];
        currentRoll.current = THREE.MathUtils.lerp(
            currentRoll.current,
            targetRoll,
            0.1
        );

        camera.rotation.z = currentRoll.current;
    });

    return null;
}
