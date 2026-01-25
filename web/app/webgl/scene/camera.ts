import * as THREE from "three";
import gsap from "gsap";

interface CameraParams {
  startPosition?: THREE.Vector3;
  endPosition?: THREE.Vector3;
  fov?: number;
  // zoomRangeMultiplier?: number;
  lerpFactor?: number;
}

export default class Camera {
  instance: THREE.PerspectiveCamera;

  overlay: THREE.Mesh;

  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;

  targetPosition = new THREE.Vector3();
  targetLookAt = new THREE.Vector3();

  // zoomRangeMultiplier: number;
  lerpFactor: number;

  private spots: THREE.Object3D[] = [];
  private lookAtTargets: THREE.Object3D[] = [];
  private currentSpotIndex = 0;

  constructor({
    startPosition = new THREE.Vector3(0, 38, 60),
    endPosition = new THREE.Vector3(0, 1, 10),
    fov = 75,
    // zoomRangeMultiplier = 0.035,
    lerpFactor = 0.1,
  }: CameraParams = {}) {
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    // this.zoomRangeMultiplier = zoomRangeMultiplier;
    this.lerpFactor = lerpFactor;

    const container = document.querySelector(".scene")!;

    this.instance = new THREE.PerspectiveCamera(
      fov,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );

    this.instance.position.copy(endPosition);
    this.targetPosition.copy(endPosition);
    this.instance.lookAt(this.targetLookAt);

    this.overlay = this.createOverlay();
    this.instance.add(this.overlay);

    this.startLoop();
  }

  private createOverlay(): THREE.Mesh {
    const overlayCanvas = document.createElement("canvas");
    overlayCanvas.width = 1;
    overlayCanvas.height = 128;
    const overlayCtx = overlayCanvas.getContext("2d");

    if (overlayCtx) {
      const grad = overlayCtx.createLinearGradient(0, 0, 0, 128);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.6, "rgba(255, 255, 255, 0)");
      overlayCtx.fillStyle = grad;
      overlayCtx.fillRect(0, 0, 1, 128);
    }

    const overlayTexture = new THREE.CanvasTexture(overlayCanvas);
    overlayTexture.colorSpace = THREE.SRGBColorSpace;

    const overlayGeo = new THREE.PlaneGeometry(4, 2);

    const overlayMat = new THREE.MeshBasicMaterial({
      color: 0x3377ed,
      map: overlayTexture,
      transparent: true,
      opacity: 0.8,
      depthTest: false,
      depthWrite: false,
      fog: false,
    });

    const mesh = new THREE.Mesh(overlayGeo, overlayMat);
    mesh.position.set(0, 0, -1.1);
    mesh.renderOrder = 9999;

    return mesh;
  }

  private startLoop() {
    const loop = () => {
      this.instance.position.lerp(this.targetPosition, this.lerpFactor);
      this.instance.lookAt(this.targetLookAt);
      requestAnimationFrame(loop);
    };
    loop();
  }

  setSpots(spots: THREE.Object3D[], lookAtTargets: THREE.Object3D[]) {
    this.spots = spots;
    this.lookAtTargets = lookAtTargets;

    this.currentSpotIndex = 0;
  }

  goToSpot(index: number) {
    const spot = this.spots[index];
    const lookAt = this.lookAtTargets[index];

    if (!spot || !lookAt) return;

    this.currentSpotIndex = index;

    gsap.to(this.targetPosition, {
      x: spot.position.x,
      y: spot.position.y,
      z: spot.position.z,
      duration: 1.2,
      ease: "power2.inOut",
    });

    gsap.to(this.targetLookAt, {
      x: lookAt.position.x,
      y: lookAt.position.y,
      z: lookAt.position.z,
      duration: 1.2,
      ease: "power2.inOut",
    });
  }

  // zoom(value: number) {
  //   const factor = 1 + value * this.zoomRangeMultiplier;
  //   this.targetPosition.y = this.endPosition.y * factor;
  // }

  entryAnim() {
    gsap.fromTo(
      this.targetPosition,
      {
        x: this.startPosition.x,
        y: this.startPosition.y,
        z: this.startPosition.z,
      },
      {
        x: this.endPosition.x,
        y: this.endPosition.y,
        z: this.endPosition.z,
        duration: 1.5,
        ease: "power3.out",
      },
    );
  }
}
