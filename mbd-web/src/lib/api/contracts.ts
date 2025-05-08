import { Food, Meal } from "../features/meals/models";
import { SymptomsEntry } from "../features/symptoms/models";
import { convertToApiDateTime } from "../utils/dateUtils";

export interface ApiFood {
  food_id: string;
  name: string;
  thumbnail: string;
}

export interface ApiMeal {
  meal_type: string;
  date_time: string;
  foods: ApiFood[];
}

export interface ApiSymptomsEntry {
  date_time: string;
  symptoms: string[];
}

export const toApiFood = (food: Food): ApiFood => ({
  food_id: food.id,
  name: food.name,
  thumbnail: food.thumbnail || " ",
});

export const toApiMeal = (meal: Meal): ApiMeal => ({
  meal_type: meal.mealType,
  date_time: convertToApiDateTime(meal.dateTime),
  foods: meal.foods.map(toApiFood),
});

export const toApiSymptomsEntry = (
  symptomsEntry: SymptomsEntry
): ApiSymptomsEntry => ({
  date_time: convertToApiDateTime(symptomsEntry.dateTime),
  symptoms: symptomsEntry.symptoms,
});
