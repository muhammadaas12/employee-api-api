const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  employeeName: String,
  employeeId: String,
  workDescription: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);
