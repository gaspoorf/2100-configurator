<script lang="ts" setup>
import QRCode from "qrcode";
import { useSocket } from "~/composables/useSocket";
import { useSocketHandler } from "~/composables/useSocketHandler";
import CloudsTransition from "~/webgl/scene/Clouds";
import { initScene } from "~/webgl/scene/config";
import { delay } from "~/webgl/utils";

import { useAudio } from "~/composables/useAudio";
import { useAmbient } from "~/composables/useAmbient";

const { initAudioContext } = useAudio();
const { startAmbient } = useAmbient();

const modalResults = ref();
const introRef = ref();
const { connect, joinRoom, sendAction, on } = useSocket();
//TODO don't use modal results in params
const { listenForUpdates } = useSocketHandler();

const uiStore = useUi();
const configStore = useConfig();

const modalPhone = ref();
const modalConfig = ref();

onMounted(async () => {
  connectToWsServer();

  window.addEventListener(
    "click",
    () => {
      initAudioContext();
      startAmbient();
    },
    { once: true },
  );

  const tl = introRef.value.loaderAnim();

  await Promise.all([initScene(), tl.then()]);

  uiStore.cloudsTransition = new CloudsTransition();

  await introRef.value.completeLoader();

  await introRef.value.revealQr();
});

function connectToWsServer() {
  nextTick(() => {
    const id = Math.random().toString(36).substring(2, 10);
    const roomId = id;
    // const roomId = "ROOM_1";
    connect();
    on("connect", () => {
      listenForUpdates();

      joinRoom(roomId);
      webSocketStore.setRoomId(roomId);

      const canvasQr = document.querySelector(
        ".qrcode .inner",
      ) as HTMLCanvasElement;
      if (canvasQr) {
        QRCode.toCanvas(canvasQr, roomId, function (error: any) {
          if (error) console.error(error);
        });
      } else {
        console.error("Canvas .qrcode introuvable");
      }
    });
  });
}

const webSocketStore = useWebSocket();

watch(
  () => webSocketStore.isRoomFull,
  async (newValue) => {
    console.log("isRoomFull", newValue);
    if (newValue) {
      await delay(1000);
      introRef.value.revealMap();
      await delay(1400);
      await modalPhone.value.animModal();
    }
  },
);

watch(
  () => configStore?.isTutoEnded,
  async (newValue) => {
    if (newValue) {
      modalConfig?.value?.animConfigModals();
    }
  },
);
watch(
  () => configStore?.isFormValidated,
  async (newValue) => {
    if (newValue) {
      modalConfig?.value?.hideModals();
    }
  },
);
</script>

<template>
  <Debug />
  <main>
    <Intro ref="introRef" />
    <ModalPhone ref="modalPhone" />
    <ModalConfig ref="modalConfig" />
    <Experience />
    <Timeline />
    <ModalResults ref="modalResults" />
    <Clouds />
  </main>
</template>

<style lang="scss">
main {
  height: 100vh;
  width: 100vw;
  position: fixed;
}
</style>
