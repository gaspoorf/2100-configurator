import type { UserConfigType, worldImpactsType } from "~/types/config";

export const useConfig = defineStore("useConfig", () => {
  const formParams = {
    step: 8,
    currentStep: 0,
  };

  const configParams = {
    yearsStep: 25, //in years
    currentYear: 2025,
    targetYear: 2100,
    maxTemperature: 5.7,
    currentTemperature: 1.2,
    minTemperature: 0,
    pivotScore: 25,
    currentImpactValue: 20,
  };

  const worldParams = {
    plane: {
      name: "plane",
      globalWeight: 0.1, // 10%
      impacts: [{ type: "fog", weight: 0.5 }],
    },
    transport: {
      name: "transport",
      globalWeight: 0.25, // 25%
      impacts: [
        { type: "fog", weight: 0.2 },
        { type: "farmhouse", weight: 0.2 },
      ],
    },
    meat: {
      name: "meat",
      globalWeight: 0.15, // 15%
      impacts: [
        { type: "lake", weight: 0.3 },
        { type: "sheeps", weight: 0.7 },
        { type: "chickens", weight: 0.7 },
        { type: "farmhouse", weight: 0.5 },
      ],
    },
    promptIA: {
      name: "promptIA",
      globalWeight: 0.02, // 2%
      impacts: [{ type: "lake", weight: 0.5 }],
    },
    products: {
      name: "products",
      globalWeight: 0.15, // 15%
      impacts: [
        { type: "factory", weight: 0.5 },
        { type: "sheeps", weight: 0.3 },
        { type: "chickens", weight: 0.3 },
        { type: "fields", weight: 1.0 },
        { type: "farmhouse", weight: 0.3 },
      ],
    },
    phone: {
      name: "phone",
      globalWeight: 0.05, // 5%
      impacts: [
        { type: "factory", weight: 0.15 },
        { type: "rocks", weight: 1 },
      ],
    },
    energy: {
      name: "energy",
      globalWeight: 0.2, // 20%
      impacts: [{ type: "fog", weight: 0.3 }],
    },
    clothes: {
      name: "clothes",
      globalWeight: 0.08, // 8%
      impacts: [
        { type: "factory", weight: 0.35 },
        { type: "lake", weight: 0.2 },
      ],
    },
  };

  const worldImpacts: worldImpactsType = {
    fog: {
      name: "fog",
      value: 0,
    },
    lake: {
      name: "lake",
      value: 0,
    },
    farmhouse: {
      name: "farmhouse",
      value: 0,
    },

    fields: {
      name: "fields",
      value: 0,
    },
    sheeps: {
      name: "sheeps",
      value: 0,
    },
    chickens: {
      name: "chickens",
      value: 0,
    },
  };

  const objectsData = {
    trees1: {
      worst: 3.8,
      bad: 2.2,
      normal: 1.2,
      best: 0.6,
    },
    trees2: {
      worst: 4.5,
      bad: 2.4,
      normal: 1.2,
      best: 1.0,
    },
    trees3: {
      worst: 3.8,
      bad: 1.8,
      normal: 1.2,
      best: 0.4,
    },
    bushes: {
      worst: 4.0,
      normal: 1.5,
      best: 1.0,
    },
    flowers: {
      worst: 2.0,
      normal: 1.2,
      best: 0.2,
    },
  };

  const userConfig: Partial<UserConfigType> = {};

  const worldStateSteps: any[] = [];

  const currentStep = ref<number>(0);

  const isFormValidated = ref<boolean>(false);
  const isTutoEnded = ref<boolean>(false);

  const globalPercentage = ref<number>(0);

  return {
    formParams,
    userConfig,
    configParams,
    worldParams,
    worldImpacts,
    worldStateSteps,
    objectsData,
    currentStep,
    isFormValidated,
    isTutoEnded,
    globalPercentage,
  };
});
