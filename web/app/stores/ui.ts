import CloudsTransition from "~/webgl/scene/Clouds";

export const useUi = defineStore("useUi", () => {
  const isLoaded = ref<boolean>(false);
  const isFormValidated = ref(false);

  const cloudsTransition = ref<CloudsTransition>();

  const previewStep = ref<number | null>(null);

  const isModalResultShown = ref<boolean>(false);
  const isExplanationsShown = ref<boolean>(false);
  const focusedExplanationQuestion = ref<number>(0);

  function changeFocusedExplanationQuestion(question: number) {
    focusedExplanationQuestion.value = question;
  }
  function toggleModalResult() {
    isModalResultShown.value = !isModalResultShown.value;
  }
  function showModalResult() {
    isModalResultShown.value = true;
  }

  function showExplanations() {
    isExplanationsShown.value = true;
  }
  return {
    isLoaded,
    isFormValidated,
    cloudsTransition,
    previewStep,
    toggleModalResult,
    isModalResultShown,
    isExplanationsShown,
    showExplanations,
    showModalResult,
    focusedExplanationQuestion,
    changeFocusedExplanationQuestion,
  };
});
