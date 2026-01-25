interface UserConfigItem {
  weight: number;
  percentage: number;
}

export interface UserConfigType {
  plane: UserConfigItem;
  dailyTransport: UserConfigItem;
  food: UserConfigItem;
  energy: UserConfigItem;
  consumption: UserConfigItem;
}

interface impactType {
  name: "fog" | "lake" | "farmhouse" | "fields" | "sheeps" | "chickens";
  value: number;
}

export interface worldImpactsType {
  fog: impactType;
  lake: impactType;
  farmhouse: impactType;
  fields: impactType;
  chickens: impactType;
  sheeps: impactType;
}
