const express = require("express");
const router = express.Router();
const Reading = require("../models/Reading");

// Get all readings
router.get("/", async (req, res) => {
  try {
    const readings = await Reading.find().sort({ createdAt: -1 });
    res.json(readings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new reading
router.post("/", async (req, res) => {
  try {
    const { glucose, note, eventType } = req.body;
    const newReading = new Reading({
      glucose,
      note,
      eventType,
    });
    const savedReading = await newReading.save();
    res.status(201).json(savedReading);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a reading
router.delete("/:id", async (req, res) => {
  try {
    const deletedReading = await Reading.findByIdAndDelete(req.params.id);
    if (!deletedReading) {
      return res.status(404).json({ message: "Reading not found" });
    }
    res.json({ message: "Reading deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;