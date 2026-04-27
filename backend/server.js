const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const readingRoutes = require("./routes/readings");
const mealRoutes = require("./routes/meals");

const app = express();

app.use(cors({
  origin: ['https://health-universe-cgm-1.onrender.com', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

app.use("/api/readings", readingRoutes);
app.use("/api/meals", mealRoutes);

app.get("/", (req, res) => {
  res.send("CGM Backend Running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});