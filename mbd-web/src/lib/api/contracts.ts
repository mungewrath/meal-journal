export interface ApiFood {
  food_id?: string;
  name: string;
  thumbnail?: string;
}

export interface ApiMeal {
  mealType: string;
  dateTime: string;
  foods: ApiFood[];
}
