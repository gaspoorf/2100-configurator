import { handleFormValidations } from "~/webgl/scene/config";
import { revealElements } from "~/webgl/scene/elementsManager";
import {
  moveToStep,
  goToCameraSpot,
  resetExperience,
} from "~/webgl/scene/experience";

interface IncomingPayload {
  type: string;
  data: any;
  [key: string]: any;
}

export function useSocketHandler() {
  const webSocketStore = useWebSocket();
  const configStore = useConfig();
  const uiStore = useUi();

  const { on, off } = useSocket();

  // Gestion du changement d'année avec délai
  let pendingYear: number | null = null;
  let yearValidationTimeout: ReturnType<typeof setTimeout> | null = null;
  const YEAR_VALIDATION_DELAY = 2000;

  function handleIncomingPayload(payload: IncomingPayload) {
    console.log("Incoming payload:", payload);

    switch (payload.type) {
      /*------- FORMS -------*/
      case "REVEAL":
        console.log("Payload → REVEAL");
        revealElements();
        break;

      case "VALIDATE_FORM":
        console.log("Payload → VALIDATE_FORM", payload.data);
        handleFormValidations(payload.data);
        break;

      case "TUTO_END":
        configStore.isTutoEnded = true;
        break;

      /*------- YEAR CONTROL -------*/
      case "YEARS": {
        const uiStore = useUi();
        const configStore = useConfig();

        const year = payload.data.strength;

        const stepIndex = configStore.worldStateSteps.findIndex(
          (step) => step.year === year,
        );
        if (stepIndex === -1) return;

        // 🔴 PREVIEW LIVE
        uiStore.previewStep = stepIndex;
        pendingYear = year;

        if (yearValidationTimeout) clearTimeout(yearValidationTimeout);

        yearValidationTimeout = setTimeout(async () => {
          if (configStore.currentStep !== stepIndex) {
            await moveToStep(stepIndex);
          }

          uiStore.previewStep = null;
          pendingYear = null;
          yearValidationTimeout = null;
        }, YEAR_VALIDATION_DELAY);

        break;
      }

      /*------- CAMERA CONTROLS -------*/
      case "CAMERA_SPOT": {
        const index = payload.data.strength - 1;
        goToCameraSpot(index);
        console.log("Camera → go to spot", index);
        break;
      }

      /*------- EXPERIENCE END -------*/
      case "END_EXPERIENCE":
        uiStore.showModalResult(); 
        console.log(uiStore.isModalResultShown);

        console.log("Payload → END_EXPERIENCE");
        break;

      /*------- SHOW EXPLANATIONS -------*/
      case "SHOW_EXPLANATIONS":
        uiStore.showExplanations();
        console.log("Payload → SHOW_EXPLANATIONS");
        break;

      /*------- CLOSE EXPLANATIONS -------*/
      case "CLOSE_EXPLANATIONS":
        uiStore.toggleModalResult();
        console.log("Payload → CLOSE_EXPLANATIONS");
        break;

      /*------- CHANGE QUESTION -------*/
      case "CHANGE_QUESTION_EXPLANATION":
        uiStore.changeFocusedExplanationQuestion(payload.data.question);
        console.log("Payload → CHANGE_QUESTION_EXPLANATION");
        break;

      case "RESET_EXPERIENCE":
        resetExperience();
        break;

      /*------- WORLD STEPS (placeholder) -------*/
      case "WORLD_STEPS":
        console.log("Payload → WORLD_STEPS", payload.data);
        break;

      default:
        console.warn("Unknown payload type:", payload.type);
    }
  }

  function handleRoomCo(payload: IncomingPayload) {
    console.log("Room count payload:", payload);

    if (payload.type === "ROOM_COUNT") {
      if (payload.count > 1) {
        webSocketStore.isRoomFull = true;
      }
    }
  }

  function handleUserJoined(payload: { userName: string }) {
    console.log("Nom du user:", payload.userName);
    webSocketStore.setUserName(payload.userName);
  }

  const listenForUpdates = () => {
    on("update-client", handleIncomingPayload);
    on("room-count", handleRoomCo);
    on("user-joined", handleUserJoined);
    console.log("Écouteurs WebSocket activés");
  };

  const stopListening = () => {
    off("update-client", handleIncomingPayload);
    off("room-count", handleRoomCo);
    off("user-joined", handleUserJoined);
    console.log("Écouteurs WebSocket désactivés");
  };

  return {
    listenForUpdates,
    stopListening,
  };
}
