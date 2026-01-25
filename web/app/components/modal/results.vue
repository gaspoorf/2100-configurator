<script lang="ts" setup>
import gsap from "gsap";
import { nextTick, ref, computed } from "vue";
import { useSocket } from "~/composables/useSocket";
import questionsData from "~/assets/content/questions.json";
import resultsData from "~/assets/content/results.json";
import { delay } from "~/webgl/utils";
import { useAudio } from "~/composables/useAudio";

const { playSuccess, playMid, playDefeat } = useAudio();

const configStore = useConfig();
const webSocketStore = useWebSocket();
const uiStore = useUi();
const { sendAction } = useSocket();

const { userName } = storeToRefs(webSocketStore);

const modal = ref<HTMLElement>();
const opacityLayer = ref<HTMLElement>();
const currentQuestion = ref<number>(0);
const userGlobalRanking = ref<number>(0);
const currentQuestionUserRanking = ref<number>(0);
const currentQuestionUserExplanation = ref<number>(0);
const questionsList = ref<HTMLElement[]>([]);

const resultsReady = ref(false);
{/* const rankEl = ref<HTMLElement | null>(null); */}


const userPercentages = ref<any>();

const rankingIcons = [
  "/icons/rank-a.webp",
  "/icons/rank-b.webp",
  "/icons/rank-c.webp",
  "/icons/rank-d.webp",
  "/icons/rank-e.webp",
  "/icons/rank-f.webp",
];

// changer les %name par le vrai username
const resultText = computed(() => {
  const rawText = resultsData[userGlobalRanking.value]?.text ?? "";
  return rawText.replace("%Name", userName.value ?? "Tu");
});

const explanationText = computed(() => {
  const rawText =
    questionsData[currentQuestion.value]?.explanations[
      currentQuestionUserExplanation.value
    ]?.text ?? "";
  return rawText.replace("%name", userName.value ?? "Tu");
});

watch(
  () => uiStore.isModalResultShown,
  (newValue) => {
    if (newValue) {
      revealResultsModal();
    } else {
      closeResultsModal();
    }
  },
);


//sounds resultats
type ResultSound = "success" | "mid" | "defeat";

function getResultSound(rankIndex: number): ResultSound {
  if (rankIndex <= 1) return "success";
  if (rankIndex <= 3) return "mid"; 
  return "defeat";
}


// méthode pour révéler le modal des résultats
async function revealResultsModal() {
  const lastStep =
    configStore.worldStateSteps[configStore.worldStateSteps.length - 1];
  userPercentages.value = lastStep?.params ?? {};

  userGlobalRanking.value = Math.round(
    (configStore.globalPercentage / 100) * (resultsData.length - 1),
  );

  resultsReady.value = true;

  await nextTick();

  await waitForImageLoad('.result-description .rank img');
  
  const resultSound = getResultSound(userGlobalRanking.value);

  if (resultSound === "success") playSuccess();
  if (resultSound === "mid") playMid();
  if (resultSound === "defeat") playDefeat();



  const resultData = resultsData[userGlobalRanking.value];
  if (resultData && webSocketStore.isConnected && webSocketStore.roomId) {
    sendAction(webSocketStore.roomId, {
      type: "RESULT_CALCULATED",
      data: {
        text: resultData.text,
        rank: resultData.rank,
      },
    });
    console.log("resultats envoyés", resultData);
  }

  gsap
    .timeline({ defaults: { ease: "cubic-bezier(0.25, 0.95, 0, 1)" } })
    .set([modal.value!, opacityLayer.value], { display: "block", opacity: 0 })
    .fromTo(
      [modal.value!, opacityLayer.value],
      { opacity: 0 },
      { opacity: 1 },
      0,
    )
    .fromTo(
      ".title p",
      { opacity: 0, y: "100%" },
      { opacity: 1, y: "0%" },
      0.35,
    )
    .fromTo(".result-description p", { opacity: 0 }, { opacity: 1 }, "<+0.2")
    .fromTo(
      ".ranking .mascot",
      { opacity: 0, y: "100%", x: "-50%" },
      { opacity: 1, y: "0%", x: "-50%", duration: 0.25 },
      "<+0.2",
    )
    .fromTo(
      ".result-description .rank",
      { opacity: 0, transform: "translateX(-50%) scale(3)" },
      {
        opacity: 1,
        transform: "translateX(-50%) scale(1) rotate(-10deg)",
        duration: 0.725,
        ease: "elastic.out(0.65,0.4)",
      },
      "<+0.135",
    );
}

watch(
  () => uiStore.isExplanationsShown,
  (newValue) => {
    if (newValue) {
      showExplanations();
      console.log("show explanations");
    } else {
      gsap.set(".explanations", { opacity: 0 });
    }
  },
);


// méthode pour afficher les explications
async function showExplanations() {

  await nextTick();

  gsap.set(modal.value!, {
    display: "flex",
  });

  const questions = document.querySelectorAll(".question");

  const illuImg = document.querySelector('.explanation-illu .illu') as HTMLImageElement;
  if (illuImg && !illuImg.complete) {
    await new Promise((resolve) => {
      illuImg.onload = resolve;
      illuImg.onerror = resolve;
    });
  }

  gsap
    .timeline({ defaults: { ease: "cubic-bezier(0.25, 0.95, 0, 1)" } })
    .set(".explanations", { opacity: 1 })
    .fromTo(".explanation-text", { opacity: 0 }, { opacity: 1 })
    .fromTo(
      ".explanation-illu .illu",
      { filter: "blur(10px)", opacity: 0 },
      { filter: "blur(0px)", opacity: 1 },
      0.125,
    )
    .fromTo(".question-icon", { opacity: 0 }, { opacity: 1 }, 0.35)
    .fromTo(
      ".explanation-illu .rank",
      { scale: 2, opacity: 0 },
      { scale: 1, opacity: 1, ease: "elastic.out(0.65,0.5)", duration: 0.7 },
      0.65,
    )
    .fromTo(
      questions,
      { transform: "translateX(-100%)", opacity: 0 },
      { transform: "translateX(0%)", opacity: 1, stagger: 0.045 },
      0.15,
    );

  changeBackgroundFocus(0);
}

function changeBackgroundFocus(target: number) {
  const bg = questionsList.value[target]?.querySelector(".background");
  console.log(bg);

  return gsap.to(bg!, { opacity: 1 });
}

// close les explications
async function closeResultsModal() {
  await gsap.to([ modal.value!, opacityLayer.value], {
    opacity: 0,
    duration: 0.5,
  });

  gsap.set([modal.value!, opacityLayer.value], { display: "none" });
  uiStore.isExplanationsShown = false;
}

watch(
  () => uiStore.focusedExplanationQuestion,
  (newValue) => {
    changeQuestion(newValue);
  },
);

{/* async function closeExplanations() {
  await gsap.to(".explanations", {
    opacity: 0,
    duration: 0.4,
  });

  uiStore.isExplanationsShown = false;
} */}


// méthode pour changer de question
async function changeQuestion(target: number) {
  const currentBg =
    questionsList.value[currentQuestion.value]?.querySelector(".background");

  await gsap
    .timeline()
    .to(".explanations-content", { opacity: 0 })
    .to(currentBg, { opacity: 0 });

  currentQuestion.value = target;

  const currentParam = questionsData[currentQuestion.value]?.params;

  const percentageValue = userPercentages.value[currentParam] ?? 0;

  currentQuestionUserRanking.value = Math.round(
    (percentageValue / 100) * (rankingIcons.length - 1),
  );

  currentQuestionUserExplanation.value = Math.round(
    (percentageValue / 100) *
      (questionsData[currentQuestion.value]?.explanations.length - 1 || 0),
  );

  await nextTick();

  await waitForImageLoad('.explanation-illu .illu');

  gsap
    .timeline()
    .add(changeBackgroundFocus(target))
    .to(".explanations-content", {
      opacity: 1,
    })
    .fromTo(
      ".explanation-illu .rank",
      { scale: 2, opacity: 0 },
      { scale: 1, opacity: 1, ease: "elastic.out(0.65,0.5)", duration: 0.7 },
      0.65,
    );
}



//attendre img chargement

function waitForImageLoad(selector: string): Promise<void> {
  return new Promise((resolve) => {
    const img = document.querySelector(selector) as HTMLImageElement;
    if (!img) {
      resolve();
      return;
    }
    if (img.complete) {
      resolve();
    } else {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    }
  });
}

// expose les méthodes pour que le parent puisse les appeler via ref
defineExpose({
  revealResultsModal,
  showExplanations,
  closeResultsModal,
  changeQuestion,
});
</script>

<template>
  <div class="results">
    <div
      class="modalResults"
      :class="{ explanation: uiStore.isExplanationsShown }"
      ref="modal"
    >
      <div class="title">
        <p>Résultats</p>
      </div>  
      <div class="ranking" v-if="!uiStore.isExplanationsShown">
        <div class="result-description">
          <div v-if="resultsReady" class="rank">
            <img :src="resultsData[userGlobalRanking]?.rank" alt="" />
          </div>
          <p>
            {{ resultText }}
          </p>
        </div>
        <div class="mascot">
          <video src="/videos/4 - resultst.webm" autoplay loop muted></video>
        </div>
      </div>
      <div class="explanations" v-else>
        <div class="explanations-content">
          <div class="question-icon">
            <img :src="questionsData[currentQuestion]?.icon" alt="" />
          </div>
          <div class="explanation-text">
            <p class="number">{{ questionsData[currentQuestion]?.number }}</p>
            <p class="explanation">
              {{ explanationText }}
            </p>
            <div class="official-data">
              <p>{{ questionsData[currentQuestion]?.officialData.text }}</p>
              <p class="source">
                Source :
                <a :href="questionsData[currentQuestion]?.officialData.link" target="_blank">{{
                  questionsData[currentQuestion]?.officialData.linkText
                }}</a>
              </p>
            </div>
          </div>
          <div class="explanation-illu">
            <div class="illu-container">
              <img
                class="illu"
                :src="
                  questionsData[currentQuestion]?.explanations[
                    currentQuestionUserExplanation
                  ]?.illustration
                "
                alt=""
              />
            </div>
            <div class="rank-container">
              <img
                :src="rankingIcons[currentQuestionUserRanking]"
                alt=""
                class="rank"
              />
            </div>
          </div>
        </div>
        <div class="questions-list">
          <div
            class="question-container"
            v-for="(question, index) in questionsData"
            :ref="
              (el) => {
                if (el) questionsList[index] = el as HTMLElement;
              }
            "
          >
            <div class="question">
              <div class="icon">
                <div class="background"></div>
                <img :src="question.icon" alt="" />
              </div>
              <div class="number">{{ question.number }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="opacity-layer" ref="opacityLayer"></div>
  </div>
</template>

<style lang="scss">
.results {
  > .modalResults {
    overflow: hidden;
    display: none;
    height: 90vh;
    width: 81.25vw;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    border-radius: 60px;
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
    &.explanation {
      align-items: end;
    }
    > .title {
      overflow: hidden;
      position: absolute;
      top: 6.6vh;
      left: 50%;
      transform: translateX(-50%);
      font-family: milling;
      font-size: 1.56vw;
    }
    .ranking {
      // opacity: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      > .result-description {
        position: relative;
        > .rank {
          width: 140px;
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
        }
        > p {
          font-size: 4vw;
          width: 54vw;
          text-align: center;
        }
      }
      > .mascot {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: -15%;
        width: 33%;
        > video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }
    .explanations {
      padding: 0 32px;
      display: flex;
      flex-direction: column;
      gap: 3vh;
      margin-bottom: 64px;
      opacity: 0;
      .explanations-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        > .question-icon {
          position: absolute;
          width: 13vw;
          height: 200px;
          top: -23%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          > img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }
        .explanation-text {
          display: flex;
          flex-direction: column;
          text-align: center;
          width: 44%;

          .number {
            font-family: OpenRunde;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 30px;
          }
          .explanation {
            font-family: milling;
            font-size: 1.875vw;
          }
          .official-data {
            margin-top: 60px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            > p {
              font-family: OpenRunde;
              font-weight: 500;
              font-size: 18px;
            }
            > .source,
            a {
              font-family: OpenRunde;
              font-weight: 600;
              font-size: 14px;
              letter-spacing: -2%;
              color: var(--grey);

              > a {
                text-decoration: underline;
              }
            }
          }
        }
        > .explanation-illu {
          width: 48%;
          position: relative;
          > .illu-container {
            border-radius: 48px;
            width: 100%;
            height: 100%;
            overflow: hidden;
            
            > .illu {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

          }
          > .rank-container {
            bottom: 20%;
            width: 16%;
            position: absolute;
            right: -4%;
            rotate: -20deg;

            > .rank {
              width: 100%;
              height: 100;
            }
          }
          
          
        }
      }
      .questions-list {
        display: flex;
        justify-content: space-between;
        padding: 0 56px;
        > .question-container {
          overflow: hidden;
          width: fit-content;
          > .question {
            display: flex;
            align-items: center;
            flex-direction: column;
            gap: 24px;
            font-family: OpenRunde;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: -2%;
            > .icon {
              position: relative;
              width: 96px;
              height: 96px;
              display: flex;
              justify-content: center;
              align-items: center;
              > .background {
                opacity: 0;
                width: 100%;
                height: 100%;
                transform: rotate(3deg);
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
                border-radius: 16px;
              }
              > img {
                width: 85%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
            }
          }
        }
      }
    }
  }
  > .opacity-layer {
    opacity: 0;
    z-index: 2;
    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;
    background-color: rgba(0, 0, 0, 0.6);
  }
}
</style>
