const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    mealType: {
      type: String,
      required: true,
      enum: ["Breakfast", "Lunch", "Dinner", "Snack"]
    },
    foodDescription: {
      type: String,
      required: true
    },
    carbs: {
      type: Number,
      required: true,
      default: 0
    },
    protein: {
      type: Number,
      required: true,
      default: 0
    },
    waterIntake: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", mealSchema);