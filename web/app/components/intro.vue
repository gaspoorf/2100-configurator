<script lang="ts" setup>
import gsap from "gsap";

const uiStore = useUi();

const loaderProgress = ref<HTMLElement>();
const loaderContainer = ref<HTMLElement>();
const appLogo = ref<HTMLElement>();
const qrCode = ref<HTMLElement>();
const qrCodeText = ref<HTMLElement>();

async function loaderAnim() {
  return gsap
    .timeline({
      defaults: { ease: "power1.inOut" },
    })
    .to(loaderProgress.value!, { width: "19%" })
    .to(
      loaderProgress.value!,
      { width: "42%", backgroundColor: "var(--pink)" },
      ">0.3",
    )
    .to(
      loaderProgress.value!,
      {
        width: "84%",
        backgroundColor: "var(--yellow)",
      },
      ">0.3",
    );
}

async function completeLoader() {
  return gsap.timeline().to(loaderProgress.value!, {
    width: "100%",
    backgroundColor: "var(--green)",
    onComplete: () => {
      uiStore.isLoaded = true;
    },
  });
}

async function revealQr() {
  return gsap
    .timeline({ defaults: { duration: 0.5 } })
    .fromTo(".scene", { opacity: 0 }, { opacity: 1, duration: 1 }, 0)
    .to(
      appLogo.value!,
      { top: "100px", width: "24vw", ease: "power1.inOut" },
      0,
    )
    .to(loaderContainer.value!, { opacity: 0 }, 0)
    .fromTo(
      qrCode.value!,
      {
        scale: 0.3,
        opacity: 0,
        rotation: -90,
        transform: "translate(-50%, -50%)  scale(0.3)",
      },
      {
        opacity: 1,
        rotation: 0,
        transform: "translate(-50%, -50%)  scale(1.0)",
      },
      0.15,
    )
    .to(qrCodeText.value!, { opacity: 1 }, 0);
}

async function revealMap() {
  return gsap
    .timeline({
      defaults: { ease: "cubic-bezier(0.25, 0.95, 0, 1)", duration: 0.75 },
      onStart() {
        uiStore.cloudsTransition?.hideClouds();
      },
    })
    .to(qrCode.value!, {
      scale: 0.6,
      opacity: 0,
      rotation: -90,
    })
    .to(qrCodeText.value!, { opacity: 0 }, 0)
    .to(appLogo.value!, { top: 0, width: "18vw" }, 0);
}

defineExpose({
  loaderAnim,
  completeLoader,
  revealQr,
  revealMap,
});
</script>

<template>
  <div class="intro">
    <div class="logo" ref="appLogo">
      <img src="/images/logo.webp" alt="" />
    </div>
    <div class="loader-progress" ref="loaderContainer">
      <div class="inner" ref="loaderProgress"></div>
    </div>

    <div class="qrcode" ref="qrCode">
      <canvas class="inner"></canvas>
    </div>
    <p class="qr-text" ref="qrCodeText">
      Scan le code QR <br />
      pour te connecter
    </p>
  </div>
</template>

<style lang="scss">
.intro {
  z-index: 3;
  position: fixed;
  height: 100vh;
  width: 100vw;
  > .logo {
    transform: rotate(-5.65deg);
    width: 28vw;
    position: absolute;
    top: 28vh;
    left: 50%;
    transform: translateX(-50%);
    > img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  > .loader-progress {
    position: absolute;
    bottom: 28vh;
    left: 50%;
    transform: translateX(-50%);
    width: 25vw;

    height: 52px;
    padding: 10px;
    border-radius: 24px;
    box-shadow:
      0 -2px 4px 0 rgba(0, 0, 0, 0.25) inset,
      -26px 82px 24px 0 rgba(0, 0, 0, 0),
      -17px 52px 22px 0 rgba(0, 0, 0, 0),
      -9px 29px 19px 0 rgba(0, 0, 0, 0.01),
      -4px 13px 14px 0 rgba(0, 0, 0, 0.01),
      -1px 3px 8px 0 rgba(0, 0, 0, 0.02);
    background: var(
      --white-gradient,
      linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.5) 0%,
        rgba(255, 255, 255, 0.5) 100%
      ),
      linear-gradient(180deg, #fcfcfc 0%, #d1d1d1 100%)
    );
    > .inner {
      border-radius: 16px;
      width: 0%;
      height: 100%;
      background-color: var(--blue);
      box-shadow:
        0 -2px 4px 0 rgba(0, 0, 0, 0.25) inset,
        -26px 82px 24px 0 rgba(0, 0, 0, 0),
        -17px 52px 22px 0 rgba(0, 0, 0, 0),
        -9px 29px 19px 0 rgba(0, 0, 0, 0.01),
        -4px 13px 14px 0 rgba(0, 0, 0, 0.01),
        -1px 3px 8px 0 rgba(0, 0, 0, 0.02);
    }
  }

  > .qrcode {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    width: 15vw;
    height: auto;
    aspect-ratio: 1/1;
    box-shadow: 0 1.8px 7.2px 0 rgba(0, 0, 0, 0.25);
    border-radius: 32px;
    background-color: #fff;
    > canvas {
      border-radius: 32px;
      width: 100% !important;
      height: 100% !important;
    }
  }
  > .qr-text {
    font-size: 2.5vw;
    letter-spacing: 0.96px;
    left: 50%;
    position: absolute;
    bottom: 100px;
    transform: translateX(-50%);
    text-align: center;
    opacity: 0;
  }
}
</style>
