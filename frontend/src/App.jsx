import { useEffect, useState } from "react";
import "./App.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const API_URL = "https://health-universe-cgm.onrender.com/api/readings";
const MEALS_API_URL = "https://health-universe-cgm.onrender.com/api/meals";

function App() {
  const [glucose, setGlucose] = useState("");
  const [note, setNote] = useState("");
  const [readings, setReadings] = useState([]);
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState("");
  const [sensorActivationDate] = useState(new Date());
  const [showReport, setShowReport] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);
  
  // Patient Profile
  const [patientName, setPatientName] = useState(() => {
    return localStorage.getItem('patientName') || '';
  });
  const [patientAge, setPatientAge] = useState(() => {
    return localStorage.getItem('patientAge') || '';
  });
  const [doctorName, setDoctorName] = useState(() => {
    return localStorage.getItem('doctorName') || '';
  });

  // Meal Form
  const [mealType, setMealType] = useState("Breakfast");
  const [foodDescription, setFoodDescription] = useState("");
  const [carbs, setCarbs] = useState("");
  const [protein, setProtein] = useState("");
  const [waterIntake, setWaterIntake] = useState("");

  const fetchReadings = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setReadings(data);
      } else {
        setReadings([]);
      }
    } catch (err) {
      console.error(err);
      setError("Backend is not connected. Make sure server is running.");
    }
  };

  const fetchMeals = async () => {
    try {
      const res = await fetch(MEALS_API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMeals(data);
      } else {
        setMeals([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReadings();
    fetchMeals();
  }, []);

  // Save patient profile to localStorage
  useEffect(() => {
    if (patientName) localStorage.setItem('patientName', patientName);
  }, [patientName]);

  useEffect(() => {
    if (patientAge) localStorage.setItem('patientAge', patientAge);
  }, [patientAge]);

  useEffect(() => {
    if (doctorName) localStorage.setItem('doctorName', doctorName);
  }, [doctorName]);

  const addReading = async (e) => {
    e.preventDefault();
    if (!glucose) return;
    
    const glucoseValue = parseInt(glucose);
    if (isNaN(glucoseValue) || glucoseValue < 40 || glucoseValue > 400) {
      setError("Please enter a valid glucose value between 40-400 mg/dL");
      return;
    }

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          glucose: glucoseValue,
          note: note || "",
          eventType: "General"
        }),
      });
      setGlucose("");
      setNote("");
      setError("");
      fetchReadings();
    } catch (err) {
      console.error(err);
      setError("Could not add reading.");
    }
  };

  const addMeal = async (e) => {
    e.preventDefault();
    if (!foodDescription || !carbs) {
      setError("Please fill in food description and carbs");
      return;
    }

    try {
      await fetch(MEALS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          mealType,
          foodDescription,
          carbs: Number(carbs),
          protein: Number(protein) || 0,
          waterIntake: Number(waterIntake) || 0
        }),
      });
      setFoodDescription("");
      setCarbs("");
      setProtein("");
      setWaterIntake("");
      setError("");
      fetchMeals();
    } catch (err) {
      console.error(err);
      setError("Could not add meal.");
    }
  };

  const deleteReading = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reading?")) return;
    
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      fetchReadings();
    } catch (err) {
      console.error(err);
      setError("Could not delete reading.");
    }
  };

  const deleteMeal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meal?")) return;
    
    try {
      await fetch(`${MEALS_API_URL}/${id}`, {
        method: "DELETE",
      });
      fetchMeals();
    } catch (err) {
      console.error(err);
      setError("Could not delete meal.");
    }
  };

  const getStatus = (value) => {
    if (value < 70) return "Low";
    if (value > 180) return "High";
    return "Normal";
  };

  const getStatusClass = (value) => {
    if (value < 70) return "low";
    if (value > 180) return "high";
    return "normal";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Just now";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Just now";
    return date.toLocaleString();
  };

  // Calculate Time in Range
  const calculateTimeInRange = () => {
    if (readings.length === 0) return { low: 0, normal: 0, high: 0 };
    
    const counts = readings.reduce((acc, reading) => {
      if (reading.glucose < 70) acc.low++;
      else if (reading.glucose > 180) acc.high++;
      else acc.normal++;
      return acc;
    }, { low: 0, normal: 0, high: 0 });

    const total = readings.length;
    return {
      low: ((counts.low / total) * 100).toFixed(1),
      normal: ((counts.normal / total) * 100).toFixed(1),
      high: ((counts.high / total) * 100).toFixed(1)
    };
  };

  // Calculate sensor days remaining
  const calculateDaysRemaining = () => {
    const now = new Date();
    const diff = now - sensorActivationDate;
    const daysUsed = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysUsed);
  };

  // Prepare chart data
  const prepareChartData = () => {
    return readings.slice(-20).map((reading, index) => ({
      index: index + 1,
      glucose: reading.glucose,
      time: new Date(reading.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  };

  // Generate Doctor Report
  const generateDoctorReport = () => {
    const stats = calculateTimeInRange();
    const avgGlucose = readings.length > 0
      ? (readings.reduce((sum, r) => sum + r.glucose, 0) / readings.length).toFixed(1)
      : 0;
    
    const lowEvents = readings.filter(r => r.glucose < 70).length;
    const highEvents = readings.filter(r => r.glucose > 180).length;

    const mealSummary = meals.slice(-5).map(m => 
      `${m.mealType}: ${m.foodDescription} (${m.carbs}g carbs, ${m.protein}g protein)`
    ).join('\n    ');

    return `
CONTINUOUS GLUCOSE MONITORING REPORT
Generated: ${new Date().toLocaleString()}

PATIENT INFORMATION:
Name: ${patientName || '[Patient Name]'}
Age: ${patientAge || '[Age]'}
Physician: Dr. ${doctorName || '[Doctor Name]'}

SENSOR INFORMATION:
Activation Date: ${sensorActivationDate.toLocaleDateString()}
Days Remaining: ${calculateDaysRemaining()} days

GLUCOSE SUMMARY (Last ${readings.length} readings):
Average Glucose: ${avgGlucose} mg/dL
Time in Range (70-180 mg/dL): ${stats.normal}%
Time Below Range (<70 mg/dL): ${stats.low}%
Time Above Range (>180 mg/dL): ${stats.high}%

HYPOGLYCEMIC EVENTS (<70 mg/dL): ${lowEvents}
HYPERGLYCEMIC EVENTS (>180 mg/dL): ${highEvents}

RECENT MEALS:
    ${mealSummary || 'No meals logged'}

GLUCOSE STORY:
${generateGlucoseStory()}

RECOMMENDATIONS:
- Continue monitoring glucose levels regularly
- ${stats.low > 10 ? 'ALERT: Frequent low glucose events detected. Consider adjusting medication or meal timing.' : 'Low glucose events are within acceptable range.'}
- ${stats.high > 30 ? 'ALERT: High percentage of time above target range. Review carbohydrate intake and medication.' : 'High glucose events are manageable.'}
- Maintain balanced nutrition and regular physical activity

---
This report is for informational purposes only.
Please consult with your healthcare provider for medical advice.
    `.trim();
  };

  // Generate Glucose Story
  const generateGlucoseStory = () => {
    if (readings.length === 0) return "No glucose data available yet.";
    
    const latest = readings[readings.length - 1];
    const status = getStatus(latest.glucose);
    const stats = calculateTimeInRange();
    
    let story = `Your current glucose is ${latest.glucose} mg/dL (${status}). `;
    
    if (stats.normal >= 70) {
      story += "Great job! You're spending most of your time in the target range. ";
    } else if (stats.high > 40) {
      story += "You're experiencing frequent high glucose levels. ";
      if (meals.length > 0) {
        story += "Review your recent meals and consider portion sizes. ";
      }
    } else if (stats.low > 15) {
      story += "You're experiencing frequent low glucose events. Consider adjusting meal timing or snack frequency. ";
    }

    if (meals.length > 0) {
      const lastMeal = meals[meals.length - 1];
      story += `Your last meal was ${lastMeal.mealType} with ${lastMeal.carbs}g carbs. `;
    }

    return story;
  };

  // Copy report to clipboard
  const copyReportToClipboard = async () => {
    const report = generateDoctorReport();
    try {
      await navigator.clipboard.writeText(report);
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const latest = readings.length > 0 ? readings[readings.length - 1] : null;
  const timeInRange = calculateTimeInRange();
  const daysRemaining = calculateDaysRemaining();
  const chartData = prepareChartData();

  return (
    <div className="App">
      <header className="header">
        <h1>🩺 Health Universe - CGM Tracker</h1>
        <p>Continuous Glucose Monitoring Dashboard</p>
      </header>

      <main className="main-content">
        {error && <div className="error-banner">{error}</div>}

        {/* Patient Profile */}
        <section className="patient-profile">
          <h2>Patient Profile</h2>
          <div className="profile-grid">
            <div className="form-group">
              <label>Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="Enter age"
              />
            </div>
            <div className="form-group">
              <label>Doctor Name</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Enter doctor's name"
              />
            </div>
          </div>
        </section>

        {/* Current Glucose Display */}
        <section className="current-glucose">
          <h2>Current Glucose</h2>
          {latest ? (
            <div className={`glucose-card ${getStatusClass(latest.glucose)}`}>
              <div className="glucose-value">{latest.glucose}</div>
              <div className="glucose-unit">mg/dL</div>
              <div className="glucose-status">{getStatus(latest.glucose)}</div>
              <div className="glucose-time">{formatDate(latest.createdAt)}</div>
            </div>
          ) : (
            <div className="glucose-card">
              <div className="glucose-value">--</div>
              <div className="glucose-unit">mg/dL</div>
              <div className="glucose-status">No data yet</div>
            </div>
          )}
        </section>

        {/* Sensor Status */}
        <section className="sensor-status">
          <h2>Sensor Status</h2>
          <div className="sensor-card">
            <div className="sensor-info">
              <p>Days Remaining</p>
              <p className="sensor-days">{daysRemaining}</p>
              <p className="sensor-subtext">out of 30 days</p>
            </div>
            <div className="sensor-progress">
              <div 
                className="sensor-progress-bar" 
                style={{ width: `${(daysRemaining / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* Time in Range */}
        <section className="time-in-range">
          <h2>Time in Range</h2>
          <div className="tir-grid">
            <div className="tir-card tir-low">
              <div className="tir-label">Low</div>
              <div className="tir-value">{timeInRange.low}%</div>
              <div className="tir-range">&lt;70 mg/dL</div>
            </div>
            <div className="tir-card tir-normal">
              <div className="tir-label">In Range</div>
              <div className="tir-value">{timeInRange.normal}%</div>
              <div className="tir-range">70-180 mg/dL</div>
            </div>
            <div className="tir-card tir-high">
              <div className="tir-label">High</div>
              <div className="tir-value">{timeInRange.high}%</div>
              <div className="tir-range">&gt;180 mg/dL</div>
            </div>
          </div>
        </section>

        {/* Glucose Trend Chart */}
        <section className="glucose-chart">
          <h2>Glucose Trend</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 400]} />
                <Tooltip />
                <ReferenceLine y={70} stroke="#ff6b6b" strokeDasharray="3 3" label="Low" />
                <ReferenceLine y={180} stroke="#ffd93d" strokeDasharray="3 3" label="High" />
                <Line type="monotone" dataKey="glucose" stroke="#6bcf7f" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Add readings to see your glucose trend</p>
          )}
        </section>

        {/* Add Reading Form */}
        <section className="add-reading">
          <h2>Add Glucose Reading</h2>
          <form onSubmit={addReading}>
            <div className="form-group">
              <label htmlFor="glucose">Glucose Level (mg/dL)</label>
              <input
                type="number"
                id="glucose"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder="Enter glucose value"
                min="40"
                max="400"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="note">Note (optional)</label>
              <input
                type="text"
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., After breakfast, Before exercise"
              />
            </div>
            <button type="submit" className="btn-primary">
              Add Reading
            </button>
          </form>
        </section>

        {/* Add Meal Form */}
        <section className="add-meal">
          <h2>Log Meal</h2>
          <form onSubmit={addMeal}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mealType">Meal Type</label>
                <select
                  id="mealType"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="foodDescription">Food Description</label>
                <input
                  type="text"
                  id="foodDescription"
                  value={foodDescription}
                  onChange={(e) => setFoodDescription(e.target.value)}
                  placeholder="e.g., Oatmeal with banana"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="carbs">Carbs (g)</label>
                <input
                  type="number"
                  id="carbs"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="Carbs"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="protein">Protein (g)</label>
                <input
                  type="number"
                  id="protein"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="Protein (optional)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="waterIntake">Water (oz)</label>
                <input
                  type="number"
                  id="waterIntake"
                  value={waterIntake}
                  onChange={(e) => setWaterIntake(e.target.value)}
                  placeholder="Water (optional)"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              Log Meal
            </button>
          </form>
        </section>

        {/* Nutrition Log */}
        <section className="nutrition-log">
          <h2>Nutrition Log</h2>
          {meals.length === 0 ? (
            <p className="no-data">No meals logged yet</p>
          ) : (
            <div className="meals-list">
              {[...meals].reverse().slice(0, 5).map((meal) => (
                <div key={meal._id} className="meal-item">
                  <div className="meal-header">
                    <span className="meal-type">{meal.mealType}</span>
                    <span className="meal-time">{formatDate(meal.createdAt)}</span>
                  </div>
                  <div className="meal-description">{meal.foodDescription}</div>
                  <div className="meal-nutrition">
                    <span>🍞 {meal.carbs}g carbs</span>
                    {meal.protein > 0 && <span>🥩 {meal.protein}g protein</span>}
                    {meal.waterIntake > 0 && <span>💧 {meal.waterIntake}oz water</span>}
                  </div>
                  <button
                    onClick={() => deleteMeal(meal._id)}
                    className="btn-delete-small"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Glucose Story */}
        <section className="glucose-story">
          <h2>Glucose Story</h2>
          <div className="story-card">
            <p>{generateGlucoseStory()}</p>
          </div>
        </section>

        {/* Recent Readings */}
        <section className="readings-history">
          <h2>Recent Readings</h2>
          {readings.length === 0 ? (
            <p className="no-data">No readings yet. Add your first reading above!</p>
          ) : (
            <div className="readings-list">
              {[...readings].reverse().slice(0, 10).map((reading) => (
                <div
                  key={reading._id}
                  className={`reading-item ${getStatusClass(reading.glucose)}`}
                >
                  <div className="reading-value">{reading.glucose} mg/dL</div>
                  <div className="reading-status">{getStatus(reading.glucose)}</div>
                  <div className="reading-time">{formatDate(reading.createdAt)}</div>
                  {reading.note && <div className="reading-note">📝 {reading.note}</div>}
                  <button
                    onClick={() => deleteReading(reading._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Doctor Report */}
        <section className="doctor-report">
          <h2>Doctor Report</h2>
          <p className="report-description">
            Generate a comprehensive glucose monitoring report to share with your healthcare provider.
          </p>
          
          {(!patientName || !patientAge || !doctorName) && (
            <p className="warning-text">
              ⚠️ Complete your Patient Profile above for a complete report
            </p>
          )}
          
          <div className="report-buttons">
            <button 
              onClick={() => setShowReport(!showReport)}
              className="report-btn"
            >
              {showReport ? '📋 Hide Report' : '📋 Generate Report'}
            </button>
            
            {showReport && (
              <button 
                onClick={copyReportToClipboard}
                className="copy-btn"
              >
                {reportCopied ? '✓ Copied!' : '📋 Copy to Clipboard'}
              </button>
            )}
          </div>

          {showReport && (
            <div className="report-preview">
              <pre>{generateDoctorReport()}</pre>
            </div>
          )}

          {reportCopied && (
            <p className="copy-success">
              ✓ Report copied! You can now paste it into an email to: samprathivangipuram@gmail.com
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;