<script lang="ts" setup>
import { handleFormValidations } from "~/webgl/scene/config";
import { revealElements } from "~/webgl/scene/elementsManager";
import {
  goToCameraSpot,
  moveToStep,
  resetExperience,
} from "~/webgl/scene/experience";

const webSocketStore = useWebSocket();
const configStore = useConfig();
const uiStore = useUi();

function endTuto() {
  configStore.isTutoEnded = true;
}

function simulateWsCo() {
  webSocketStore.isRoomFull = true;
}

// const userData = {
//   plane: 0,
//   transport: 0,
//   meat: 0,
//   promptIA: 0,
//   products: 0,
//   phone: 0,
//   energy: 0,
//   clothes: 0,
// };
const userData = {
  plane: 100,
  transport: 100,
  meat: 100,
  promptIA: 100,
  products: 100,
  phone: 100,
  energy: 100,
  clothes: 100,
};
// const userData = {
//   plane: 100,
//   transport: 100,
//   meat: 70,
//   promptIA: 55,
//   products: 30,
//   phone: 10,
//   energy: 100,
//   clothes: 90,
// };
</script>

<template>
  <div class="debug">
    <button @click="simulateWsCo" v-if="!webSocketStore.isRoomFull">
      simulate co
    </button>
    <div class="controls-debug" v-if="webSocketStore.isRoomFull">
      <div class="form-controls" v-if="!configStore.isFormValidated">
        <h2>FORM</h2>
        <button @click="endTuto">endTuto</button>
        <button @click="revealElements">simulate one form step validate</button>
        <button @click="handleFormValidations(userData)">
          Validate the form
        </button>
      </div>
      <div
        class="world-controls"
        v-if="
          configStore.isFormValidated &&
          configStore.currentStep !== configStore.worldStateSteps.length - 1
        "
      >
        <h2>YEARS</h2>
        <div
          class="years-controls"
          style="display: flex; flex-direction: column; gap: 24px"
        >
          <button @click="moveToStep(0)">2025</button>
          <button @click="moveToStep(1)">2050</button>
          <button @click="moveToStep(2)">2075</button>
          <button @click="moveToStep(3)">2100</button>
        </div>
        <h2>CAMERA SPOT</h2>
        <div
          class="camera-controls"
          style="display: flex; flex-direction: column; gap: 24px"
        >
          <button @click="goToCameraSpot(0)">spot 1</button>
          <button @click="goToCameraSpot(1)">spot 2</button>
          <button @click="goToCameraSpot(2)">spot 3</button>
        </div>
      </div>

      <div
        class="experienceEnds-control"
        v-if="
          configStore.currentStep === configStore.worldStateSteps.length - 1
        "
      >
        <h2>RESULTS</h2>
        <button @click="uiStore.toggleModalResult()">Finish experience</button>
        <button @click="uiStore.showExplanations()">Show explanations</button>
        <button @click="uiStore.changeFocusedExplanationQuestion(3)">
          changeQuestions
        </button>
        <button @click="uiStore.toggleModalResult()">closeResults</button>
        <button @click="resetExperience">reset experience</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.debug {
  height: 100vh;
  width: 100vw;
  position: fixed;
  z-index: 2;
  > button {
    padding: 14px;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    position: absolute;
  }
  > .controls-debug {
    position: fixed;
    top: 24px;
    left: 24px;
    background-color: rgba(154, 154, 154, 0.4);
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
    > div {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    button {
      padding: 12px 24px;
      background-color: white;
      border: 1px solid black;
      border-radius: 24px;
    }
  }
}
</style>
