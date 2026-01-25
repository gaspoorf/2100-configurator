import * as THREE from "three";
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  SSAOEffect,
  VignetteEffect,
  NoiseEffect,
  BrightnessContrastEffect,
  HueSaturationEffect,
} from "postprocessing";

export default class PostProcessing {
  composer: EffectComposer;

  bloom: BloomEffect;
// //   ssao: SSAOEffect;
  vignette: VignetteEffect;
//   noise: NoiseEffect;
    brightnessContrast: BrightnessContrastEffect;
    hueSaturation: HueSaturationEffect;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    this.composer = new EffectComposer(renderer);

    // render de base
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // bloom (soft)
    this.bloom = new BloomEffect({
      intensity: 0.8,
      luminanceThreshold: 0.7,
      luminanceSmoothing: 0.15,
    });

    this.brightnessContrast = new BrightnessContrastEffect({
        brightness: 0.03,
        contrast: 0.15,
    });

    this.hueSaturation = new HueSaturationEffect({
        saturation: 0.15,
    });


    // SSAO très léger (important en low poly)
    // this.ssao = new SSAOEffect(camera, undefined, {
    //   intensity: 0.6,
    //   radius: 0.15,
    //   luminanceInfluence: 0.6,
    // });

    // vignette
    this.vignette = new VignetteEffect({
      offset: 0.3,
      darkness: 0.4,
    });

    // // grain léger
    // this.noise = new NoiseEffect({
    //   premultiply: true,
    // });

    const effectPass = new EffectPass(
        camera,
        this.vignette,
        this.bloom,
        this.brightnessContrast,
        this.hueSaturation,
    );

    this.composer.addPass(effectPass);
  }

  setSize(width: number, height: number) {
    this.composer.setSize(width, height);
  }

  render(delta?: number) {
    this.composer.render(delta);
  }
}
