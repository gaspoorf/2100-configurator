<script lang="ts" setup>
import gsap from "gsap";
import { delay } from "~/webgl/utils";
import { useAudio } from "~/composables/useAudio";

const modal = ref<HTMLElement>();
const mascot = ref<HTMLElement>();

// musique
const { playOnboarding, initAudioContext } = useAudio();
async function revealModal() {
  gsap.set(modal.value!, { display: "flex" });
  gsap.set(mascot.value!, { display: "flex" });


  initAudioContext();
  playOnboarding();

  await gsap
    .timeline({
      defaults: { ease: "cubic-bezier(0.25, 0.95, 0, 1)" },
      duration: 0.5,
    })
    .fromTo(
      modal.value!,
      { opacity: 0, rotate: -30 },
      { opacity: 1, rotate: 0 },
      0,
    )
    .fromTo(mascot.value!, { y: "100%" }, { y: "20%" }, 0)
    .then();
}

async function hideModal() {
  await gsap
    .timeline({
      defaults: { ease: "cubic-bezier(0.25, 0.95, 0, 1)" },
      duration: 0.5,
    })
    .to(
      modal.value!,
      { opacity: 0, rotate: -10, ease: "power2.out", duration: 0.35 },
      0,
    )
    .to(mascot.value!, { y: "100%" }, 0)
    .then();
}

async function animModal() {
  await revealModal();
  await delay(1000);
  await hideModal();
}

defineExpose({ animModal });
</script>

<template>
  <div class="modalPhone">
    <div class="modal" ref="modal">
      <p>
        Ton téléphone a <br />
        rejoint la partie
      </p>
    </div>
    <div class="mascot" ref="mascot">
      <video src="/videos/1 - thumb up.webm" autoplay loop muted></video>
    </div>
  </div>
</template>

<style lang="scss">
.modalPhone {
  > .modal {
    z-index: 2;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 60px;
    border-radius: 32px;
    width: 28vw;
    background: var(
      --white-gradient,
      linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.5) 0%,
        rgba(255, 255, 255, 0.5) 100%
      ),
      linear-gradient(180deg, #fcfcfc 0%, #d1d1d1 100%)
    );
    box-shadow:
      0 -2px 4px 0 rgba(0, 0, 0, 0.25) inset,
      -26px 82px 24px 0 rgba(0, 0, 0, 0),
      -17px 52px 22px 0 rgba(0, 0, 0, 0),
      -9px 29px 19px 0 rgba(0, 0, 0, 0.01),
      -4px 13px 14px 0 rgba(0, 0, 0, 0.01),
      -1px 3px 8px 0 rgba(0, 0, 0, 0.02);
    display: none;

    justify-content: center;
    > p {
      text-align: center;
    }
    &:before {
      content: "";
      background-image: url("/icons/check.webp");
      background-position: center;
      background-repeat: no-repeat;
      width: 160px;
      height: 160px;
      object-fit: contain;
      position: absolute;
      top: -50%;
      left: 50%;
      transform: translateX(-50%) scale(0.8);
    }
  }
  > .mascot {
    display: none;

    z-index: 2;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 32vw;
    height: auto;

    > video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>
