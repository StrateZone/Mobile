import { Ingredient } from "./ingrdients.type";

export type Category = {
  id: number;
  name: string;
  ingredientCategories: Ingredient[];
};
