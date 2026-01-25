import { defineStore } from "pinia";
import { ref } from "vue";

export const useWebSocket = defineStore("useWebSocket", () => {
  const isConnected = ref<boolean>(false);
  const isRoomFull = ref<boolean>(false);
  const roomId = ref<string | null>(null);
  const userName = ref<string | null>(null);

  function setRoomId(id: string) {
    roomId.value = id;
  }

  function setUserName(name: string) {
    userName.value = name;
  }

  return { isConnected, isRoomFull, roomId, userName, setRoomId, setUserName };
});
