const express = require("express");
const router = express.Router();
const Meal = require("../models/Meal");

// Get all meals
router.get("/", async (req, res) => {
  try {
    const meals = await Meal.find().sort({ createdAt: -1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new meal
router.post("/", async (req, res) => {
  try {
    const { mealType, foodDescription, carbs, protein, waterIntake } = req.body;
    const newMeal = new Meal({
      mealType,
      foodDescription,
      carbs,
      protein,
      waterIntake
    });
    const savedMeal = await newMeal.save();
    res.status(201).json(savedMeal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a meal
router.delete("/:id", async (req, res) => {
  try {
    const deletedMeal = await Meal.findByIdAndDelete(req.params.id);
    if (!deletedMeal) {
      return res.status(404).json({ message: "Meal not found" });
    }
    res.json({ message: "Meal deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;