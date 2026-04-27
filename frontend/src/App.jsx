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
  const [showReport, setShowReport] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);
  
  // Sensor activation date - saved permanently
  const [sensorActivationDate] = useState(() => {
    const saved = localStorage.getItem('sensorActivationDate');
    return saved ? new Date(saved) : new Date();
  });
  
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

  useEffect(() => {
    if (patientName) localStorage.setItem('patientName', patientName);
  }, [patientName]);

  useEffect(() => {
    if (patientAge) localStorage.setItem('patientAge', patientAge);
  }, [patientAge]);

  useEffect(() => {
    if (doctorName) localStorage.setItem('doctorName', doctorName);
  }, [doctorName]);

  // Save sensor activation date
  useEffect(() => {
    if (sensorActivationDate) {
      localStorage.setItem('sensorActivationDate', sensorActivationDate.toISOString());
    }
  }, [sensorActivationDate]);

  const addReading = async (e) => {
    e.preventDefault();
    if (!glucose) return;
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          glucose: Number(glucose),
          note: note || "",
          eventType: "General"
        }),
      });
      setGlucose("");
      setNote("");
      fetchReadings();
    } catch (err) {
      console.error(err);
      setError("Could not add reading.");
    }
  };

  const addMeal = async (e) => {
    e.preventDefault();
    if (!foodDescription) return;
    try {
      await fetch(MEALS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mealType,
          foodDescription,
          carbs: Number(carbs) || 0,
          protein: Number(protein) || 0,
          waterIntake: Number(waterIntake) || 0
        }),
      });
      setFoodDescription("");
      setCarbs("");
      setProtein("");
      setWaterIntake("");
      setMealType("Breakfast");
      fetchMeals();
    } catch (err) {
      console.error(err);
      setError("Could not add meal.");
    }
  };

  const deleteReading = async (id) => {
    if (!confirm("Are you sure you want to delete this reading?")) return;
    
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
    if (!confirm("Are you sure you want to delete this meal?")) return;
    
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
    return date.toLocaleString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const calculateTimeInRange = () => {
    if (readings.length === 0) return { low: 0, normal: 0, high: 0 };
    
    const low = readings.filter(r => r.glucose < 70).length;
    const high = readings.filter(r => r.glucose > 180).length;
    const normal = readings.filter(r => r.glucose >= 70 && r.glucose <= 180).length;
    
    const total = readings.length;
    
    return {
      low: Math.round((low / total) * 100),
      normal: Math.round((normal / total) * 100),
      high: Math.round((high / total) * 100),
      lowCount: low,
      normalCount: normal,
      highCount: high,
      total: total
    };
  };

  const calculateNutritionStats = () => {
    if (meals.length === 0) return { avgCarbs: 0, avgProtein: 0, totalWater: 0, mealCount: 0 };
    
    const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const totalWater = meals.reduce((sum, m) => sum + (m.waterIntake || 0), 0);
    
    return {
      avgCarbs: Math.round(totalCarbs / meals.length),
      avgProtein: Math.round(totalProtein / meals.length),
      totalWater: totalWater,
      mealCount: meals.length
    };
  };

  const generateDoctorReport = () => {
    if (readings.length === 0) {
      return "No glucose readings available to generate report.";
    }

    const stats = calculateTimeInRange();
    const nutritionStats = calculateNutritionStats();
    const values = readings.map(r => r.glucose);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.round(Math.sqrt(variance));

    const lowEpisodes = readings.filter(r => r.glucose < 70);
    const highEpisodes = readings.filter(r => r.glucose > 180);

    const today = new Date();
    const reportDate = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const displayName = patientName || '[Patient Name Not Set]';
    const displayAge = patientAge || '[Age Not Set]';
    const displayDoctor = doctorName || '[Doctor Name Not Set]';

    let report = `
═══════════════════════════════════════════════════════════
           GLUCOSE MONITORING REPORT
           Health Universe CGM
═══════════════════════════════════════════════════════════

Patient: ${displayName}
Age: ${displayAge}
Primary Care Physician: Dr. ${displayDoctor}
Report Date: ${reportDate}
Report Period: Last ${readings.length} readings
Monitoring Device: CGM Sensor (Activated ${sensorActivationDate.toLocaleDateString()})

───────────────────────────────────────────────────────────
SUMMARY STATISTICS
───────────────────────────────────────────────────────────

Total Readings: ${readings.length}
Average Glucose: ${avg} mg/dL
Glucose Range: ${min} - ${max} mg/dL
Standard Deviation: ${stdDev} mg/dL

───────────────────────────────────────────────────────────
NUTRITION SUMMARY
───────────────────────────────────────────────────────────

Total Meals Logged: ${nutritionStats.mealCount}
Average Carbs per Meal: ${nutritionStats.avgCarbs}g
Average Protein per Meal: ${nutritionStats.avgProtein}g
Total Water Intake: ${nutritionStats.totalWater} oz

───────────────────────────────────────────────────────────
TIME IN RANGE ANALYSIS
───────────────────────────────────────────────────────────

✓ In Range (70-180 mg/dL): ${stats.normal}% (${stats.normalCount} readings)
⚠ Below Range (<70 mg/dL): ${stats.low}% (${stats.lowCount} readings)
⚠ Above Range (>180 mg/dL): ${stats.high}% (${stats.highCount} readings)

Target: ≥70% time in range
Status: ${stats.normal >= 70 ? '✓ GOAL MET' : '⚠ BELOW TARGET'}

───────────────────────────────────────────────────────────
CLINICAL OBSERVATIONS
───────────────────────────────────────────────────────────
`;

    if (stats.normal >= 70) {
      report += `\n✓ Excellent glycemic control maintained.\n`;
    } else if (stats.normal >= 50) {
      report += `\n• Moderate control. Consider reviewing meal timing and medication.\n`;
    } else {
      report += `\n⚠ Poor glycemic control. Immediate intervention recommended.\n`;
    }

    if (nutritionStats.avgCarbs > 60) {
      report += `\n⚠ High average carbohydrate intake (${nutritionStats.avgCarbs}g per meal)\n`;
      report += `   Consider reducing portion sizes or choosing lower-carb options.\n`;
    }

    if (nutritionStats.totalWater < 64 && meals.length > 0) {
      report += `\n💧 Low water intake detected (${nutritionStats.totalWater} oz total)\n`;
      report += `   Aim for at least 64 oz (8 glasses) daily for optimal health.\n`;
    }

    if (lowEpisodes.length > 0) {
      report += `\n⚠ LOW GLUCOSE EPISODES: ${lowEpisodes.length} occurrence(s)\n`;
      report += `   Lowest Reading: ${min} mg/dL\n`;
      report += `   Action: Review medication dosing and meal timing.\n`;
    }

    if (highEpisodes.length > 0) {
      report += `\n⚠ HIGH GLUCOSE EPISODES: ${highEpisodes.length} occurrence(s)\n`;
      report += `   Highest Reading: ${max} mg/dL\n`;
      report += `   Action: Consider adjusting insulin/medication regimen.\n`;
    }

    if (stdDev > 50) {
      report += `\n• High glucose variability detected (SD: ${stdDev} mg/dL)\n`;
      report += `   Recommendation: Focus on consistent meal timing and portions.\n`;
    } else if (stdDev < 30) {
      report += `\n✓ Excellent glucose stability (SD: ${stdDev} mg/dL)\n`;
    }

    report += `
───────────────────────────────────────────────────────────
RECENT READINGS (Last 10)
───────────────────────────────────────────────────────────
`;

    const recent10 = readings.slice(0, 10).reverse();
    recent10.forEach(r => {
      const status = getStatus(r.glucose);
      const statusSymbol = status === "Normal" ? "✓" : "⚠";
      report += `\n${statusSymbol} ${formatDate(r.createdAt)} - ${r.glucose} mg/dL [${status}]`;
      if (r.note) {
        report += `\n   Note: ${r.note}`;
      }
    });

    if (meals.length > 0) {
      report += `\n
───────────────────────────────────────────────────────────
RECENT MEALS (Last 5)
───────────────────────────────────────────────────────────
`;
      const recent5Meals = meals.slice(0, 5).reverse();
      recent5Meals.forEach(m => {
        report += `\n🍽️  ${formatDate(m.createdAt)} - ${m.mealType}`;
        report += `\n   Food: ${m.foodDescription}`;
        report += `\n   Carbs: ${m.carbs}g | Protein: ${m.protein}g | Water: ${m.waterIntake}oz`;
      });
    }

    report += `\n
───────────────────────────────────────────────────────────
RECOMMENDATIONS
───────────────────────────────────────────────────────────
`;

    if (stats.low > 0) {
      report += `\n1. Address hypoglycemia risk - consider medication adjustment\n`;
    }
    if (stats.high > 30) {
      report += `\n2. Frequent hyperglycemia - review carbohydrate intake\n`;
    }
    if (stats.normal < 70) {
      report += `\n3. Increase time in range - consider diabetes education program\n`;
    }
    if (stdDev > 50) {
      report += `\n4. Reduce glucose variability through consistent routine\n`;
    }
    if (nutritionStats.avgCarbs > 60) {
      report += `\n5. Reduce carbohydrate portions to improve glucose control\n`;
    }
    
    report += `\n6. Continue regular monitoring and follow-up appointments\n`;

    report += `
───────────────────────────────────────────────────────────
NEXT APPOINTMENT
───────────────────────────────────────────────────────────

Please schedule follow-up with Dr. ${displayDoctor} to discuss:
- Medication adjustment if needed
- Dietary modifications based on nutrition log
- Exercise program optimization
- Sensor replacement (Current sensor expires: ${getSensorExpiryDate()})

═══════════════════════════════════════════════════════════
Report generated by Health Universe CGM
For questions: samprathivangipuram@gmail.com
═══════════════════════════════════════════════════════════
`;

    return report;
  };

  const copyReportToClipboard = () => {
    const report = generateDoctorReport();
    navigator.clipboard.writeText(report).then(() => {
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 3000);
    });
  };

  const generateGlucoseStory = () => {
    if (readings.length === 0) {
      return {
        summary: "Start adding glucose readings to see your personalized insights!",
        insights: [],
        emoji: "📊"
      };
    }

    const stats = calculateTimeInRange();
    const nutritionStats = calculateNutritionStats();
    const insights = [];
    let emoji = "📊";
    let summary = "";

    if (stats.normal >= 70) {
      summary = "Excellent glucose control! You're doing great! 🎉";
      emoji = "🌟";
      insights.push("Your glucose is in range " + stats.normal + "% of the time - this is outstanding!");
    } else if (stats.normal >= 50) {
      summary = "Good progress! Room for improvement. 💪";
      emoji = "👍";
      insights.push("You're in range " + stats.normal + "% of the time. Aim for 70% or higher.");
    } else {
      summary = "Let's work on getting more readings in range. 🎯";
      emoji = "⚠️";
      insights.push("Only " + stats.normal + "% of readings are in range. Consider reviewing your diabetes management plan.");
    }

    // Nutrition insights
    if (nutritionStats.mealCount > 0) {
      if (nutritionStats.avgCarbs > 60) {
        insights.push("🍞 Your meals average " + nutritionStats.avgCarbs + "g of carbs. Consider smaller portions to reduce glucose spikes.");
      } else if (nutritionStats.avgCarbs < 30) {
        insights.push("✅ Great job keeping carbs moderate at " + nutritionStats.avgCarbs + "g per meal!");
      }

      if (nutritionStats.avgProtein < 15) {
        insights.push("🥩 Try adding more protein (currently " + nutritionStats.avgProtein + "g/meal). Protein helps stabilize blood sugar.");
      }

      if (nutritionStats.totalWater < 64) {
        insights.push("💧 Hydration is low (" + nutritionStats.totalWater + " oz). Aim for 64+ oz daily.");
      }
    }

    if (stats.high > 30) {
      insights.push("⚠️ You have frequent high readings (" + stats.highCount + " total). Review your meal timing and portions.");
    } else if (stats.high > 0) {
      insights.push("You had " + stats.highCount + " high reading" + (stats.highCount > 1 ? "s" : "") + ". Consider what you ate before these episodes.");
    }

    if (stats.low > 20) {
      insights.push("🚨 You have several low readings (" + stats.lowCount + " total). Talk to your doctor about adjusting medication.");
    } else if (stats.low > 0) {
      insights.push("You had " + stats.lowCount + " low reading" + (stats.lowCount > 1 ? "s" : "") + ". Keep fast-acting carbs nearby.");
    }

    const mealRelated = readings.filter(r => 
      r.note && (r.note.toLowerCase().includes('meal') || 
                 r.note.toLowerCase().includes('breakfast') ||
                 r.note.toLowerCase().includes('lunch') ||
                 r.note.toLowerCase().includes('dinner'))
    );
    
    if (mealRelated.length > 0) {
      const highAfterMeals = mealRelated.filter(r => r.glucose > 180).length;
      if (highAfterMeals >= 2) {
        insights.push("🍽️ Pattern detected: Glucose tends to spike after meals. Try eating protein before carbs.");
      }
    }

    if (readings.length >= 3) {
      const values = readings.slice(0, 10).map(r => r.glucose);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      if (stdDev < 30) {
        insights.push("✅ Your glucose levels are stable with minimal variation - great consistency!");
      } else if (stdDev > 60) {
        insights.push("📈 Your glucose shows high variability. Focus on consistent meal timing and portions.");
      }
    }

    if (readings.length >= 3) {
      const recent3 = readings.slice(0, 3);
      const allInRange = recent3.every(r => r.glucose >= 70 && r.glucose <= 180);
      if (allInRange) {
        insights.push("🔥 You're on a streak! Last 3 readings are all in range!");
      }
    }

    if (insights.length === 1) {
      insights.push("💡 Keep logging regularly to unlock more personalized insights.");
    }

    return { summary, insights, emoji };
  };

  const predictRisk = () => {
    if (readings.length < 3) {
      return {
        risk: "none",
        message: "Add more readings to enable risk prediction",
        icon: "📊",
        color: "#64748b"
      };
    }

    const recent = readings.slice(0, 3);
    const values = recent.map(r => r.glucose);
    const latest = values[0];

    if (values[0] < values[1] && values[1] < values[2]) {
      const drop = values[2] - values[0];
      if (drop > 30 && latest < 100) {
        return {
          risk: "low",
          message: "⚠️ Risk of low glucose detected - trending down rapidly",
          recommendation: "Have fast-acting carbs ready (juice, glucose tabs)",
          icon: "🔵",
          color: "#3b82f6"
        };
      }
    }

    if (values[0] > values[1] && values[1] > values[2]) {
      const rise = values[0] - values[2];
      if (rise > 40 && latest > 140) {
        return {
          risk: "high",
          message: "🔴 Risk of high glucose - trending up rapidly",
          recommendation: "Monitor closely and consider exercise or medication adjustment",
          icon: "🔴",
          color: "#ef4444"
        };
      }
    }

    if (latest < 70) {
      return {
        risk: "low",
        message: "🚨 Current glucose is LOW - take action now!",
        recommendation: "Consume 15g fast-acting carbs immediately",
        icon: "🔵",
        color: "#3b82f6"
      };
    }

    if (latest > 180) {
      return {
        risk: "high",
        message: "🔴 Current glucose is HIGH",
        recommendation: "Stay hydrated and monitor. Contact doctor if persistent.",
        icon: "🔴",
        color: "#ef4444"
      };
    }

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev > 50) {
      return {
        risk: "moderate",
        message: "⚡ High variability detected in recent readings",
        recommendation: "Focus on consistent meal timing and portions",
        icon: "⚡",
        color: "#f59e0b"
      };
    }

    return {
      risk: "none",
      message: "✅ No immediate risk detected - levels are stable",
      recommendation: "Keep up the good work! Continue current management plan.",
      icon: "✅",
      color: "#22c55e"
    };
  };

  const getSensorDaysRemaining = () => {
    const now = new Date();
    const diffTime = now - sensorActivationDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = 30 - diffDays;
    return remaining > 0 ? remaining : 0;
  };

  const getSensorExpiryDate = () => {
    const expiryDate = new Date(sensorActivationDate);
    expiryDate.setDate(expiryDate.getDate() + 30);
    return expiryDate.toLocaleDateString();
  };

  const chartData = readings
    .slice()
    .reverse()
    .slice(-20)
    .map(reading => ({
      time: formatTime(reading.createdAt),
      glucose: reading.glucose,
      timestamp: new Date(reading.createdAt).getTime()
    }));

  const stats = calculateTimeInRange();
  const latest = readings.length > 0 ? readings[0] : null;
  const daysRemaining = getSensorDaysRemaining();
  const sensorProgress = ((30 - daysRemaining) / 30) * 100;
  const story = generateGlucoseStory();
  const riskPrediction = predictRisk();

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Health Universe CGM</h1>
          <p>Modern diabetes monitoring dashboard</p>
        </div>
      </header>

      {error && <div className="error-box">{error}</div>}

      <main className="dashboard">
        <section className="card profile-card">
          <h2>👤 Patient Profile</h2>
          <p className="profile-subtitle">Enter your information once - it will be saved automatically</p>
          <div className="profile-form">
            <div className="profile-field">
              <label>Patient Name</label>
              <input
                type="text"
                placeholder="e.g., John Doe"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div className="profile-field">
              <label>Age</label>
              <input
                type="number"
                placeholder="e.g., 45"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
              />
            </div>
            <div className="profile-field">
              <label>Doctor Name</label>
              <input
                type="text"
                placeholder="e.g., Smith"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
            </div>
          </div>
          {(patientName || patientAge || doctorName) && (
            <p className="profile-saved">✓ Profile saved automatically</p>
          )}
        </section>

        <section className="card hero-card">
          <p className="label">Current Glucose</p>
          <div className="glucose-value">
            {latest ? latest.glucose : "--"}
            <span>mg/dL</span>
          </div>
          {latest ? (
            <span className={`status ${getStatusClass(latest.glucose)}`}>
              {getStatus(latest.glucose)}
            </span>
          ) : (
            <span className="status normal">No Data</span>
          )}
          <p className="updated">
            Last updated: {latest ? formatDate(latest.createdAt) : "No readings yet"}
          </p>
          {latest && latest.note && (
            <p className="hero-note">📝 {latest.note}</p>
          )}
        </section>

        <section className="card sensor-card">
          <h2>Sensor Status</h2>
          <div className="sensor-info">
            <div className="sensor-days">
              <div className="days-remaining">{daysRemaining}</div>
              <div className="days-label">Days Remaining</div>
            </div>
            <div className="sensor-details">
              <p>Activated: {sensorActivationDate.toLocaleDateString()}</p>
              <p>Expires: {getSensorExpiryDate()}</p>
            </div>
          </div>
          <div className="sensor-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${sensorProgress}%` }}
              ></div>
            </div>
          </div>
        </section>

        <section className="card risk-card" style={{ borderColor: riskPrediction.color }}>
          <h2>{riskPrediction.icon} Risk Prediction</h2>
          <div className="risk-message" style={{ color: riskPrediction.color }}>
            <p className="risk-headline">{riskPrediction.message}</p>
          </div>
          {riskPrediction.recommendation && (
            <div className="risk-recommendation">
              <strong>Recommendation:</strong>
              <p>{riskPrediction.recommendation}</p>
            </div>
          )}
        </section>

        <section className="card story-card">
          <h2>{story.emoji} Your Glucose Story</h2>
          <div className="story-summary">
            <p className="story-headline">{story.summary}</p>
          </div>
          <div className="story-insights">
            {story.insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <span className="insight-bullet">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card time-in-range-card">
          <h2>Time in Range</h2>
          <div className="tir-stats">
            <div className="tir-item">
              <div className="tir-circle low-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle low-circle-path"
                    strokeDasharray={`${stats.low}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{stats.low}%</text>
                </svg>
              </div>
              <div className="tir-label">
                <strong>Low</strong>
                <span>&lt; 70 mg/dL</span>
                <span className="count">{stats.lowCount} readings</span>
              </div>
            </div>

            <div className="tir-item">
              <div className="tir-circle normal-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle normal-circle-path"
                    strokeDasharray={`${stats.normal}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{stats.normal}%</text>
                </svg>
              </div>
              <div className="tir-label">
                <strong>In Range</strong>
                <span>70-180 mg/dL</span>
                <span className="count">{stats.normalCount} readings</span>
              </div>
            </div>

            <div className="tir-item">
              <div className="tir-circle high-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle high-circle-path"
                    strokeDasharray={`${stats.high}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{stats.high}%</text>
                </svg>
              </div>
              <div className="tir-label">
                <strong>High</strong>
                <span>&gt; 180 mg/dL</span>
                <span className="count">{stats.highCount} readings</span>
              </div>
            </div>
          </div>
        </section>

        <section className="card form-card">
          <h2>Add Glucose Reading</h2>
          <form onSubmit={addReading}>
            <input
              type="number"
              placeholder="Glucose level (e.g., 110)"
              value={glucose}
              onChange={(e) => setGlucose(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Add note (e.g., Before breakfast, After exercise)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button type="submit">Add Reading</button>
          </form>
        </section>

        <section className="card form-card">
          <h2>🍽️ Log Meal</h2>
          <form onSubmit={addMeal}>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              required
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
            <input
              type="text"
              placeholder="What did you eat? (e.g., Chicken salad)"
              value={foodDescription}
              onChange={(e) => setFoodDescription(e.target.value)}
              required
            />
            <div className="nutrition-row">
              <input
                type="number"
                placeholder="Carbs (g)"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
              <input
                type="number"
                placeholder="Protein (g)"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
              <input
                type="number"
                placeholder="Water (oz)"
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value)}
              />
            </div>
            <button type="submit">Log Meal</button>
          </form>
        </section>

        <section className="card chart-card">
          <h2>Glucose Trend</h2>
          {readings.length === 0 ? (
            <div className="empty-chart">Add readings to see your glucose trend.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  domain={[0, 400]}
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <ReferenceLine y={70} stroke="#3b82f6" strokeDasharray="3 3" />
                <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="3 3" />
                
                <Line 
                  type="monotone" 
                  dataKey="glucose" 
                  stroke="#0f766e" 
                  strokeWidth={3}
                  dot={{ fill: '#0f766e', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
              Low Threshold (70)
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#ef4444' }}></span>
              High Threshold (180)
            </span>
          </div>
        </section>

        <section className="card list-card">
          <h2>Recent Readings</h2>
          <div className="reading-list">
            {readings.length === 0 ? (
              <p className="muted">No readings added yet.</p>
            ) : (
              readings
                .slice()
                .reverse()
                .slice(0, 10)
                .map((reading, index) => (
                  <div className="reading-item" key={reading._id || index}>
                    <div className="reading-info">
                      <div>
                        <strong>{reading.glucose} mg/dL</strong>
                        <p className="reading-date">{formatDate(reading.createdAt)}</p>
                        {reading.note && (
                          <p className="reading-note">📝 {reading.note}</p>
                        )}
                      </div>
                      <span className={`status ${getStatusClass(reading.glucose)}`}>
                        {getStatus(reading.glucose)}
                      </span>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteReading(reading._id)}
                      title="Delete reading"
                    >
                      🗑️
                    </button>
                  </div>
                ))
            )}
          </div>
        </section>

        <section className="card nutrition-card">
          <h2>🍽️ Nutrition Log</h2>
          <div className="reading-list">
            {meals.length === 0 ? (
              <p className="muted">No meals logged yet.</p>
            ) : (
              meals
                .slice()
                .reverse()
                .slice(0, 10)
                .map((meal, index) => (
                  <div className="reading-item" key={meal._id || index}>
                    <div className="reading-info">
                      <div>
                        <strong>{meal.mealType}: {meal.foodDescription}</strong>
                        <p className="reading-date">{formatDate(meal.createdAt)}</p>
                        <p className="meal-nutrients">
                          Carbs: {meal.carbs}g | Protein: {meal.protein}g | Water: {meal.waterIntake}oz
                        </p>
                      </div>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteMeal(meal._id)}
                      title="Delete meal"
                    >
                      🗑️
                    </button>
                  </div>
                ))
            )}
          </div>
        </section>

        <section className="card summary-card">
          <h2>📋 Doctor Report</h2>
          <p style={{ marginBottom: '16px' }}>
            Generate a comprehensive medical report for your healthcare provider.
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