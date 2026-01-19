import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber/native";
import * as THREE from "three";

const cameraPositions = [
    new THREE.Vector3(-13, 18, 19),
    new THREE.Vector3(2, -1, 21),
    new THREE.Vector3(-5, 2, 22),
    new THREE.Vector3(-16, 2, 16),
    new THREE.Vector3(-16, -12, 17),
    new THREE.Vector3(-7, -12, 22),
    new THREE.Vector3(10, -11, 19),
    new THREE.Vector3(8, -20, 29),
    new THREE.Vector3(10, -6.5, 40),
];

const cameraLookAt = [
    new THREE.Vector3(-2, 9, -6),
    new THREE.Vector3(8.5, 5, 0),
    new THREE.Vector3(-1, 4, 0),
    new THREE.Vector3(-8, 6, 0),
    new THREE.Vector3(-9, -6, 0),
    new THREE.Vector3(-1, -6, 0),
    new THREE.Vector3(6.5, -8, 0),
    new THREE.Vector3(2, -14, 0),
    new THREE.Vector3(0, -6.5, 0),
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

        camera.position.lerp(cameraPositions[index],0.07);
        currentLookAt.current.lerp(cameraLookAt[index],0.07);
        camera.lookAt(currentLookAt.current);

        const targetRoll = cameraRotationZ[index];
        currentRoll.current = THREE.MathUtils.lerp(
            currentRoll.current,
            targetRoll,
            0.07
        );

        camera.rotation.z = currentRoll.current;
    });

    return null;
}
