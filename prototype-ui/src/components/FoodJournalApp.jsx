import React, { useState } from "react";
import moment from "moment";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus, SkipForward, ChevronDown } from "lucide-react";

const FoodJournalApp = () => {
  const mealColors = {
    Breakfast: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      border: "border-amber-200",
      hover: "hover:bg-amber-200",
      chip: "bg-amber-50",
      header: "bg-amber-500 text-white",
    },
    Lunch: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      hover: "hover:bg-emerald-200",
      chip: "bg-emerald-50",
      header: "bg-emerald-500 text-white",
    },
    Dinner: {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      border: "border-indigo-200",
      hover: "hover:bg-indigo-200",
      chip: "bg-indigo-50",
      header: "bg-indigo-500 text-white",
    },
    Snack: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
      hover: "hover:bg-purple-200",
      chip: "bg-purple-50",
      header: "bg-purple-500 text-white",
    },
  };

  const [meals, setMeals] = useState([
    {
      id: 1,
      date: "2025-01-04",
      time: "08:00",
      type: "Breakfast",
      foods: ["Oatmeal", "Banana", "Coffee"],
    },
    {
      id: 2,
      date: "2025-01-03",
      time: "19:00",
      type: "Dinner",
      foods: ["Grilled Chicken", "Rice", "Broccoli"],
    },
    {
      id: 3,
      date: "2025-01-03",
      time: "12:30",
      type: "Lunch",
      foods: ["Turkey Sandwich", "Apple", "Chips"],
    },
    {
      id: 4,
      date: "2025-01-03",
      time: "15:30",
      type: "Snack",
      foods: ["Yogurt", "Granola"],
    },
  ]);

  const getNextMealFromHistory = (currentMeals = meals) => {
    if (currentMeals.length === 0)
      return {
        type: "Breakfast",
        date: moment().format("YYYY-MM-DD"),
        time: defaultTimeForMeal("Breakfast"),
      };

    // Find the latest main meal (excluding snacks)
    const latestMainMeal = currentMeals.find((meal) =>
      ["Breakfast", "Lunch", "Dinner"].includes(meal.type)
    );

    if (!latestMainMeal) {
      return {
        type: "Breakfast",
        date: moment().format("YYYY-MM-DD"),
        time: defaultTimeForMeal("Breakfast"),
      };
    }

    // Utility function to get ISO format for backend
    const getISODateTime = (date, time) => {
      return moment(`${date} ${time}`, "YYYY-MM-DD HH:mm").toISOString();
    };

    console.log(
      `Latest meal: ${latestMainMeal.type} ${latestMainMeal.date} ${latestMainMeal.time}`
    );

    const latestMoment = moment(
      `${latestMainMeal.date} ${latestMainMeal.time}`,
      "YYYY-MM-DD HH:mm"
    );
    const latestType = latestMainMeal.type;

    // If the latest meal was dinner, return breakfast for next day
    if (latestType === "Dinner") {
      const nextDate = latestMoment.add(1, "days");
      return {
        type: "Breakfast",
        date: nextDate.format("YYYY-MM-DD"),
        time: defaultTimeForMeal("Breakfast"),
      };
    }

    // Otherwise return next meal in sequence for same day
    const nextType = getNextMealInSequence(latestType);
    return {
      type: nextType,
      date: latestMoment.format("YYYY-MM-DD"),
      time: defaultTimeForMeal(nextType),
    };
  };

  const getNextMealInSequence = (mealType) => {
    const sequence = ["Breakfast", "Lunch", "Dinner"];
    const currentIndex = sequence.indexOf(mealType);
    return sequence[(currentIndex + 1) % sequence.length];
  };

  const defaultTimeForMeal = (mealType) => {
    switch (mealType) {
      case "Breakfast":
        return "08:00";
      case "Lunch":
        return "12:30";
      case "Dinner":
        return "18:30";
      default:
        return "10:00";
    }
  };

  const [nextMeal, setNextMeal] = useState(getNextMealFromHistory());

  const [selectedFoods, setSelectedFoods] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const suggestions = [
    { type: "Yesterday", items: ["Oatmeal", "Coffee", "Banana"] },
    {
      type: "Recent Meals",
      items: ["Grilled Chicken", "Rice", "Turkey Sandwich"],
    },
    { type: "Common Foods", items: ["Coffee", "Water", "Apple"] },
  ];

  const currentMealType = nextMeal.type;
  const currentColors = mealColors[currentMealType];

  const handleAddFood = (food) => {
    console.log("rawr");
    setSelectedFoods([...selectedFoods, food]);
    setInputValue("");
  };

  const handleRemoveFood = (index) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const handleMealSubmit = (e) => {
    console.log("Recording meal");

    const newMeal = {
      id: Math.max(...meals.map((em) => em.id)) + 1,
      foods: selectedFoods,
      ...nextMeal,
    };

    setMeals((prevMeals) => {
      const updatedMeals = [newMeal, ...prevMeals];
      const nextMealType = getNextMealFromHistory(updatedMeals);
      setNextMeal(nextMealType);
      return updatedMeals;
    });
    setSelectedFoods([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Input Section */}
      <Card className={`border-2 ${currentColors.border}`}>
        <CardHeader className={`${currentColors.header} rounded-t-lg`}>
          <CardTitle className="flex items-center justify-between">
            <span>
              Enter {currentMealType} for{" "}
              {moment(
                `${nextMeal.date} ${nextMeal.time}`,
                "YYYY-MM-DD HH:mm"
              ).format("ddd M/D/YY")}
            </span>
            <div className="space-x-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Snack
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <SkipForward className="w-4 h-4 mr-1" />
                Skip Meal
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className={`${currentColors.bg}`}>
          {/* Selected Foods */}
          <div className="flex flex-wrap gap-2 py-4">
            {selectedFoods.map((food, index) => (
              <div
                key={index}
                className={`${currentColors.chip} ${currentColors.text} px-3 py-1 rounded-full flex items-center border ${currentColors.border}`}
              >
                {food}
                <button
                  onClick={() => handleRemoveFood(index)}
                  className={`ml-2 ${currentColors.text} hover:opacity-70`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Input and Suggestions */}
          <div className="space-y-4">
            <div className="relative">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddFood(inputValue);
                }}
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Add food item..."
                  className="w-full p-2 border rounded-md bg-white/80"
                />
              </form>
            </div>

            {/* Suggestions */}
            <div className="space-y-4">
              {suggestions.map((group) => (
                <div key={group.type}>
                  <h3
                    className={`text-sm font-medium ${currentColors.text} mb-2`}
                  >
                    {group.type}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleAddFood(item)}
                        className={`${currentColors.chip} ${currentColors.hover} ${currentColors.text} px-3 py-1 rounded-full text-sm border ${currentColors.border}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button
              className={`w-full mt-4 ${currentColors.header}`}
              onClick={handleMealSubmit}
            >
              Submit Meal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Section */}
      <Card>
        <CardHeader className="bg-gray-100 rounded-t-lg">
          <CardTitle>Meal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meals.map((meal) => {
              const colors = mealColors[meal.type];
              return (
                <div
                  key={meal.id}
                  className={`${colors.bg} rounded-lg p-4 border ${colors.border}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className={`w-4 h-4 ${colors.text}`} />
                      <span className={`font-medium ${colors.text}`}>
                        {moment(meal.date, "YYYY-MM-DD").format("ddd M/D/YY")}
                      </span>
                      <Clock className={`w-4 h-4 ${colors.text} ml-2`} />
                      <span className={colors.text}>
                        {moment(meal.time, "HH:mm").format("h:mm A")}
                      </span>
                    </div>
                    <span
                      className={`${colors.header} px-3 py-1 rounded-full text-sm`}
                    >
                      {meal.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {meal.foods.map((food, index) => (
                      <span
                        key={index}
                        className={`${colors.chip} ${colors.text} px-3 py-1 rounded-full text-sm border ${colors.border}`}
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            <Button variant="outline" className="w-full">
              <ChevronDown className="w-4 h-4 mr-2" />
              Load More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodJournalApp;
