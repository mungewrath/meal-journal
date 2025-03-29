export interface Food {
  id: string;
  name: string;
  thumbnail?: string;
}

export interface Meal {
  id: string;
  mealType: string;
  dateTime: string;
  foods: Food[];
}

export interface MealsState {
  meals: Meal[];
  loading: boolean;
  daysLoaded: number;
}
