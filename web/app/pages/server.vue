<script lang="ts" setup>
import { useSocket } from "~/composables/useSocket";

const {
  socket,
  isConnected,
  connect,
  disconnect,
  joinRoom,
  sendAction,
  on,
  off,
} = useSocket();
const roomId = "ROOM_1";

function handleWsCo() {
  connect();
  on("connect", () => {
    joinRoom(roomId);
  });
}

function revealOneStep() {
  sendAction(roomId, { type: "REVEAL" });
}

onMounted(() => {
  on("update-client", (data) => {
    console.log(data);
  });
});
</script>

<template>
  <button @click="handleWsCo" v-if="!isConnected">Join ws server</button>
  <button v-if="isConnected" @click="revealOneStep">Reveal</button>
</template>

<style lang="scss"></style>
