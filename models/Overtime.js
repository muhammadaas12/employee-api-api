const mongoose = require("mongoose");

const OvertimeSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeId: { type: String, required: true },
  hours: { type: Number, required: true },
  workDescription: { type: String, required: true },
  date: { type: Date, default: Date.now }, // ✅ add this
});

module.exports = mongoose.model("Overtime", OvertimeSchema);
