<script lang="ts" setup>
const configStore = useConfig();
</script>

<template>
  <div class="experience">
    <Scene />
    <div class="main-ui">
      <div class="temperature-indicator" v-if="configStore.isFormValidated">
        <p>
          {{
            (
              configStore.worldStateSteps[configStore.currentStep].temperature +
              27
            ).toFixed(1)
          }}°C
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.experience {
  height: 100vh;
  width: 100vw;
  position: fixed;
  > .main-ui {
    height: 100%;
    width: 100%;
    position: relative;
    z-index: 1;
    > .temperature-indicator {
      position: absolute;
      right: 0;
      top: 0;
      right: 60px;
      top: 60px;
      padding: 1.56vw 2.06vw;
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
      border-radius: 32px;
      > p {
        font-size: 1.66vw;
        line-height: 125%;
      }
    }
  }
}
</style>
