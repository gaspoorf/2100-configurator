import { Howl, Howler } from "howler";

// Sons d'ambiance
const ambient = new Howl({
  src: ["/audio/ambient.ogg"],
  loop: true,
  volume: 0.1,
  preload: true,
});

const ambientDark = new Howl({
  src: ["/audio/dark-ambient.ogg"],
  loop: true,
  volume: 0.3,
  preload: true,
});

const onboardingSound = new Howl({
  src: ["/audio/onboarding.wav"],
  volume: 0.7,
  preload: true,
});

const revealSounds = [
  new Howl({
    src: ["/audio/pop1.wav"],
    volume: 0.8,
    preload: true,
  }),
  new Howl({
    src: ["/audio/pop3.wav"],
    volume: 0.8,
    preload: true,
  }),
  new Howl({
    src: ["/audio/pop3.wav"],
    volume: 0.8,
    preload: true,
  }),
];

const cloudsSound = new Howl({
  src: ["/audio/clouds.wav"],
  volume: 1.8,
  preload: true,
});

const cameraSound = new Howl({
  src: ["/audio/camera.mp3"],
  volume: 0.2,
  preload: true,
});

const successSound = new Howl({
  src: ["/audio/success.wav"],
  volume: 0.8,
  preload: true,
});

const midSound = new Howl({
  src: ["/audio/mid.wav"],
  volume: 0.8,
  preload: true,
});

const defeatSound = new Howl({
  src: ["/audio/defeat.wav"],
  volume: 0.8,
  preload: true,
});

const isMuted = ref(false);
let isTransitioning = false;

export const useAudio = () => {
  const initAudioContext = () => {
    if (Howler.ctx && Howler.ctx.state === "suspended") {
      Howler.ctx.resume();
    }
  };

  // Musique ambiance
  const playGoodAmbient = () => {
    if (ambient.playing() || isTransitioning) return;
    
    isTransitioning = true;
    ambient.volume(0.1);
    ambient.play();
    
    if (ambientDark.playing()) {
      ambientDark.fade(ambientDark.volume(), 0, 2000);
      setTimeout(() => {
        ambientDark.stop();
        isTransitioning = false;
      }, 2000);
    } else {
      isTransitioning = false;
    }
  };

  const playDarkAmbient = () => {
    if (ambientDark.playing() || isTransitioning) return;
    
    isTransitioning = true;
    ambientDark.volume(0.3);
    ambientDark.play();
    
    if (ambient.playing()) {
      ambient.fade(ambient.volume(), 0, 2000);
      setTimeout(() => {
        ambient.stop();
        isTransitioning = false;
      }, 2000);
    } else {
      isTransitioning = false;
    }
  };

  // Sons design
  const playOnboarding = () => {
    onboardingSound.play();
  };

  const playReveal = () => {
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * revealSounds.length);
      revealSounds[randomIndex].play();
    }, 500);
  };

  const playClouds = () => {
    cloudsSound.play();
  };

  const playCamera = () => {
    setTimeout(() => {
      cameraSound.play();
    }, 300);
  };

  // Success sounds
  const playSuccess = () => {
    successSound.play();
  };

  const playMid = () => {
    midSound.play();
  };

  const playDefeat = () => {
    defeatSound.play();
  };

  return {
    initAudioContext,
    playGoodAmbient,
    playDarkAmbient,
    playOnboarding,
    playReveal,
    playClouds,
    playCamera,
    playSuccess,
    playMid,
    playDefeat,
    isMuted,
  };
};