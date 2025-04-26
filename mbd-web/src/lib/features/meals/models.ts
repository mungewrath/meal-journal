export interface Food {
  id: string;
  name: string;
  thumbnail?: string;
  isSuggested?: boolean;
}

export interface Meal {
  id: string;
  mealType: string;
  dateTime: string;
  foods: Food[];
}
