<script lang="ts" setup>
import gsap from "gsap";
import { delay } from "~/webgl/utils";

const configStore = useConfig();
const uiStore = useUi();

const worldYears = ref<any[]>();
const yearsStepsRefs = ref<HTMLElement[]>([]);
const timeline = ref<HTMLElement>();

const coucouVideo = ref<HTMLVideoElement>();
const hotVideo = ref<HTMLVideoElement>();

const stepWidth = ref<number>(0);
const yearWidth = ref<number>(0);
const baseOffset = ref<number>(0);

let lastTarget: number | null = null;


const currentTemperature = computed(() => {
  if (!configStore.isFormValidated) return null;
  const step = uiStore.previewStep ?? configStore.currentStep;
  if (step == null) return null;
  return configStore.worldStateSteps[step]?.temperature + 27;
});


//video via temp

const isHot = computed(() => {
  return currentTemperature.value !== null && currentTemperature.value > 29.5;
});

watch(isHot, (hot) => {
  if (!hotVideo.value || !coucouVideo.value) return;
  if (hot) {
    gsap.to(coucouVideo.value, { opacity: 0, duration: 0.5 });
    gsap.to(hotVideo.value, { opacity: 1, duration: 0.5 });
  } else {
    gsap.to(hotVideo.value, { opacity: 0, duration: 0.5 });
    gsap.to(coucouVideo.value, { opacity: 1, duration: 0.5 });
  }
});



watch(
  () => uiStore.previewStep ?? configStore.currentStep,
  (step) => {
    if (step == null || !worldYears.value) return;
    slideTimeline(step);
  },
);

watch(
  () => configStore.isFormValidated,
  async (newValue) => {
    if (newValue) {
      worldYears.value = configStore.worldStateSteps.map((step) => step.year);
      await nextTick();

      if (yearsStepsRefs.value[0]) {
        stepWidth.value = yearsStepsRefs.value[0].clientWidth;
        yearWidth.value =
          yearsStepsRefs.value[0].querySelector(".inner")?.clientWidth || 0;

        baseOffset.value = -yearWidth.value / 2;

        gsap.set(timeline.value!, { x: baseOffset.value });
        await delay(1700);
        entryTimeline();
      }
    } else {
      leaveTimeline();
    }
  },
);

function leaveTimeline() {
  const dateStep = timeline.value!.querySelectorAll(".step");
  gsap.to(dateStep, {
    x: "100%",
    opacity: 0,
    ease: "cubic-bezier(0.25, 0.95, 0, 1)",
    stagger: {
      each: 0.075,
      from: "end",
    },
  });
}

function slideTimeline(target: number) {
  const slideTl = gsap.timeline();

  if (lastTarget !== null && yearsStepsRefs.value[lastTarget]) {
    const lastStep = yearsStepsRefs.value[lastTarget];
    const lastInner = lastStep.querySelector(".inner");
    const lastText = lastInner?.querySelector("p");
    const lastDot = lastStep.querySelector(".indicator");

    slideTl.add(
      gsap
        .timeline({ defaults: { ease: "cubic-bezier(0.25, 0.95, 0, 1)" } })
        .to(lastInner, { scale: 0.84 })
        .to(lastText, { fontSize: "1.66vw", color: "var(--grey)" }, 0)
        .to(lastDot, { backgroundColor: "var(--grey)" }, 0),
      0,
    );
  }

  const newTransform = baseOffset.value - target * stepWidth.value;

  if (yearsStepsRefs.value[target]) {
    const step = yearsStepsRefs.value[target];
    const stepInner = step.querySelector(".inner");
    const stepText = stepInner?.querySelector("p");
    const stepDot = step.querySelector(".indicator");

    slideTl
      .to(stepInner, { scale: 1 }, 0)
      .to(stepText, { fontSize: "1.75vw", color: "black" }, 0)
      .to(stepDot, { backgroundColor: "black" }, 0)
      .to(
        timeline.value!,
        {
          x: newTransform,
          duration: 0.8,
          ease: "power2.inOut",
        },
        0,
      );
  }

  lastTarget = target;
}

function entryTimeline() {
  const dateStep = timeline.value!.querySelectorAll(".step");
  gsap
    .timeline({ defaults: { ease: "cubic-bezier(0.25, 0.95, 0, 1)" } })
    .fromTo(
      dateStep,
      { x: "100%", opacity: 0 },
      {
        x: "0%",
        opacity: 1,
        stagger: 0.175,
        onStart() {
          gsap.delayedCall(0.6, () => slideTimeline(0));
        },
      },
    )
    .fromTo(
      ".timeline-mascot",
      {
        transform: "translateX(-100%) rotate(15deg)",
        opacity: 0,
      },
      { transform: "translateX(0%) rotate(15deg)", opacity: 1 },

      0,
    );
}
</script>

<template>
  <div class="timeline-container">
    <div class="timeline-mascot">
      <video ref="coucouVideo" src="/videos/3-coucou.webm" class="mascot-video mascot-video--base" :style="{ opacity: 1 }" autoplay loop muted></video>
      <video ref="hotVideo" src="/videos/hot.webm" class="mascot-video mascot-video--overlay" :style="{ opacity: 0 }" autoplay loop muted></video>
    </div>
    <div class="timeline" ref="timeline">
      <div
        class="step"
        v-for="(year, index) in worldYears"
        :key="year"
        ref="yearsStepsRefs"
      >
        <div class="date-container">
          <div class="inner">
            <p>{{ year }}</p>
          </div>
          <div class="indicator"></div>
        </div>
        <div
          class="indicator separator"
          v-if="index !== worldYears.length - 1"
        ></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.indicator {
  height: 14px;
  width: 4px;
  background-color: var(--grey);
  border-radius: 50%;
}
.timeline-container {
  z-index: 2;
  width: 100vw;
  position: absolute;
  bottom: 0;
  > .timeline-mascot {
    position: fixed;
    bottom: -13%;
    width: 32vw;
    height: auto;
    left: -8%;
    rotate: 15deg;
    opacity: 0;
    z-index: 1;

    > .mascot-video {
      width: 100%;
      object-fit: contain;
    }

    > .mascot-video--base {
      position: relative;
      display: block;
    }

    > .mascot-video--overlay {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
    }

  }
  .timeline {
    margin-left: 50%;

    // right: 50%;
    // transform: translateX(-50%);

    display: flex;
    > .step {
      display: flex;
      align-items: end;
      opacity: 0;
      > .date-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        gap: 16px;

        > .inner {
          scale: 0.84;
          padding: 32px 48px;
          border-radius: 32px;
          display: flex;
          justify-content: center;
          align-items: center;
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
          > p {
            font-size: 1.75vw;
            color: var(--grey);
          }
        }
      }
      > .indicator {
        margin: 0 30px;
      }
    }
  }
}
</style>
