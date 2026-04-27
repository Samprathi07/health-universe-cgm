const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema(
  {
    glucose: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    eventType: {
      type: String,
      default: "General",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reading", readingSchema);