<script lang="ts" setup></script>

<template>
  <div class="clouds-transition" key="clouds">
    <div class="cloud">
      <img src="/images/cloud.webp" alt="" />
    </div>
    <div class="cloud">
      <img src="/images/cloud.webp" alt="" />
    </div>
    <div class="cloud">
      <img src="/images/cloud.webp" alt="" />
    </div>
    <div class="cloud">
      <img src="/images/cloud.webp" alt="" />
    </div>
    <div class="cloud">
      <img src="/images/cloud.webp" alt="" />
    </div>
    <div class="cloud">
      <img src="/images/cloud.webp" alt="" />
    </div>
  </div>
</template>

<style lang="scss">
.clouds-transition {
  height: 100vh;
  width: 100vw;
  position: fixed;
  z-index: 2;
  top: 0;
  pointer-events: none;

  > .cloud {
      position: absolute;
      width: 170vw;
      height: 110%;
      &:nth-of-type(1) {
        left: -52%;
        top: -37%;
      }
    &:nth-of-type(2) {
      right: -53%;
      top: -37%;
      transform: rotate(180deg);
    }
    &:nth-of-type(3) {
      left: -54%;
      bottom: -15%;
    }
    &:nth-of-type(4) {
      left: 28%;
      bottom: -44%;
    }
    &:nth-of-type(5) {
      left: 2%;
      bottom: -14%;
    }
    &:nth-of-type(6) {
      left: -72%;
      bottom: -38%;
      transform: rotate(180deg);
    }
    > img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>
