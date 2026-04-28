const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const readingRoutes = require("./routes/readings");
const mealRoutes = require("./routes/meals");

const app = express();

// CORS Configuration - Allow frontend domain
app.use(cors({
  origin: [
    'https://health-universe-cgm-1.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
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