import { Ingredient } from "./ingrdients.type";
import { Occasion } from "./occasion.type";

export type Recipe = {
  id: number;
  name: string;
  imageUrl: string;
  cookingTime?: string;
  serving?: number;
  content?: string;
  tutorial?: string;
  ingredientNames?: Ingredient[];
  occasion?: Occasion;
  occasionName: string;
  video?: string;
  createdAt?: string;
};
