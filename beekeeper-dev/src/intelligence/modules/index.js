import { analyseQueen } from "../queen";
import { analyseBrood } from "../brood";
import { analyseFood } from "../food";
import { analysePopulation } from "../population";

export const intelligenceModules = [
  analyseQueen,
  analyseBrood,
  analyseFood,
  analysePopulation,
];