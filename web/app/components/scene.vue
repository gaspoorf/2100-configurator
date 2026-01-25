<script lang="ts" setup></script>

<template>
  <div class="scene">
    <canvas></canvas>
  </div>
</template>

<style lang="scss">
.scene {
  height: 100vh;
  width: 100vw;
  position: fixed;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  padding: 30px 30px 10vh;
  box-sizing: border-box;

  > canvas {
    width: 100% !important;
    height: 100% !important;
    border-radius: 44px;
    object-fit: cover;
  }
}
</style>
