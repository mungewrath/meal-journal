interface Food {
  id: string;
  name: string;
  thumbnail?: string;
}

interface Meal {
  id: string;
  mealType: string;
  dateTime: string;
  foods: Food[];
}

const setTime = (date: Date, hours: number, minutes: number): Date => {
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

export const generateMockMeals = (): Meal[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);

  return [
    {
      id: "1",
      mealType: "Breakfast",
      dateTime: setTime(today, 8, 0).toISOString(),
      foods: [
        { id: "1", name: "Eggs" },
        { id: "2", name: "Bacon" },
      ],
    },
    {
      id: "2",
      mealType: "Lunch",
      dateTime: setTime(today, 12, 0).toISOString(),
      foods: [
        { id: "3", name: "Sandwich" },
        { id: "4", name: "Salad" },
      ],
    },
    {
      id: "3",
      mealType: "Dinner",
      dateTime: setTime(today, 18, 0).toISOString(),
      foods: [
        { id: "5", name: "Steak" },
        { id: "6", name: "Potatoes" },
      ],
    },
    {
      id: "4",
      mealType: "Breakfast",
      dateTime: setTime(yesterday, 8, 0).toISOString(),
      foods: [
        { id: "7", name: "Pancakes" },
        { id: "8", name: "Sausage" },
      ],
    },
    {
      id: "5",
      mealType: "Lunch",
      dateTime: setTime(yesterday, 12, 0).toISOString(),
      foods: [
        { id: "9", name: "Burger" },
        { id: "10", name: "Fries" },
      ],
    },
    {
      id: "6",
      mealType: "Dinner",
      dateTime: setTime(yesterday, 18, 0).toISOString(),
      foods: [
        { id: "11", name: "Chicken" },
        { id: "12", name: "Rice" },
      ],
    },
    {
      id: "7",
      mealType: "Breakfast",
      dateTime: setTime(twoDaysAgo, 8, 0).toISOString(),
      foods: [
        { id: "13", name: "Oatmeal" },
        { id: "14", name: "Fruit" },
      ],
    },
    {
      id: "8",
      mealType: "Lunch",
      dateTime: setTime(twoDaysAgo, 12, 0).toISOString(),
      foods: [
        { id: "15", name: "Pizza" },
        { id: "16", name: "Salad" },
      ],
    },
    {
      id: "9",
      mealType: "Dinner",
      dateTime: setTime(twoDaysAgo, 18, 0).toISOString(),
      foods: [
        { id: "17", name: "Fish" },
        { id: "18", name: "Vegetables" },
      ],
    },
    {
      id: "10",
      mealType: "Breakfast",
      dateTime: setTime(threeDaysAgo, 8, 0).toISOString(),
      foods: [
        { id: "19", name: "Toast" },
        { id: "20", name: "Jam" },
      ],
    },
    {
      id: "11",
      mealType: "Lunch",
      dateTime: setTime(threeDaysAgo, 12, 0).toISOString(),
      foods: [
        { id: "21", name: "Pasta" },
        { id: "22", name: "Garlic Bread" },
      ],
    },
    {
      id: "12",
      mealType: "Dinner",
      dateTime: setTime(threeDaysAgo, 18, 0).toISOString(),
      foods: [
        { id: "23", name: "Soup" },
        { id: "24", name: "Salad" },
      ],
    },
  ];
};
