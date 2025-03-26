const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
const foodNames = [
  "Apple",
  "Banana",
  "Carrot",
  "Donut",
  "Egg",
  "Fish",
  "Grapes",
];

let mealIdCounter = 1;
let foodIdCounter = 1;

export const generateMockMeals = (days: number, offset: number) => {
  const meals = [];
  const now = new Date();

  for (let i = offset; i < offset + days; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    for (const mealType of mealTypes) {
      if (mealType === "Snack" && Math.random() > 0.5) {
        continue; // Skip adding a Snack occasionally
      }

      const mealDate = new Date(date);
      switch (mealType) {
        case "Breakfast":
          mealDate.setHours(8, 0, 0, 0);
          break;
        case "Lunch":
          mealDate.setHours(12, 0, 0, 0);
          break;
        case "Dinner":
          mealDate.setHours(18, 0, 0, 0);
          break;
        case "Snack":
          mealDate.setHours(
            Math.floor(Math.random() * 24),
            Math.floor(Math.random() * 60),
            0,
            0
          );
          break;
      }

      const foods = foodNames
        .filter(() => Math.random() > 0.5) // Filter out some foods randomly
        .map((name) => ({
          id: (foodIdCounter++).toString(),
          name,
        }));

      meals.push({
        id: (mealIdCounter++).toString(),
        mealType,
        dateTime: mealDate.toISOString(),
        foods,
      });
    }
  }

  return meals;
};
