import nigeriaData from "nigeria-state-lga-data/data/nigeria.json";

type NigeriaStateRecord = {
  name: string;
  lgas: string[];
};

type NigeriaLocationDataset = {
  states: NigeriaStateRecord[];
};

const dataset = nigeriaData as NigeriaLocationDataset;

export const nigeriaStates = dataset.states
  .map((state) => state.name)
  .sort((left, right) => left.localeCompare(right));

export function localGovernmentsForState(stateName: string) {
  const state = dataset.states.find((entry) => entry.name.toLowerCase() === stateName.trim().toLowerCase());
  return state?.lgas.slice().sort((left, right) => left.localeCompare(right)) ?? [];
}

export function isNigerianState(stateName: string) {
  return nigeriaStates.some((state) => state.toLowerCase() === stateName.trim().toLowerCase());
}
