const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// MIDDLEWARE - CORS MUST BE FIRST!
// ========================================

// Enable CORS for your frontend
app.use(cors({
  origin: 'https://health-universe-cgm-1.onrender.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// ========================================
// IN-MEMORY DATA STORAGE
// ========================================

let readings = [];
let meals = [];

// ========================================
// ROUTES
// ========================================

// Root endpoint - health check
app.get('/', (req, res) => {
  res.send('CGM Backend Running');
});

// GET all readings
app.get('/api/readings', (req, res) => {
  res.json(readings);
});

// POST new reading
app.post('/api/readings', (req, res) => {
  const { value, timestamp } = req.body;
  
  if (!value || !timestamp) {
    return res.status(400).json({ error: 'Missing value or timestamp' });
  }
  
  const newReading = {
    id: Date.now(),
    value: parseInt(value),
    timestamp: timestamp
  };
  
  readings.push(newReading);
  res.status(201).json(newReading);
});

// GET all meals
app.get('/api/meals', (req, res) => {
  res.json(meals);
});

// POST new meal
app.post('/api/meals', (req, res) => {
  const { name, carbs, timestamp } = req.body;
  
  if (!name || !carbs || !timestamp) {
    return res.status(400).json({ error: 'Missing name, carbs, or timestamp' });
  }
  
  const newMeal = {
    id: Date.now(),
    name: name,
    carbs: parseInt(carbs),
    timestamp: timestamp
  };
  
  meals.push(newMeal);
  res.status(201).json(newMeal);
});

// DELETE reading
app.delete('/api/readings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = readings.findIndex(r => r.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Reading not found' });
  }
  
  readings.splice(index, 1);
  res.status(204).send();
});

// DELETE meal
app.delete('/api/meals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = meals.findIndex(m => m.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Meal not found' });
  }
  
  meals.splice(index, 1);
  res.status(204).send();
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});