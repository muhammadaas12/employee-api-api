const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const Report = require("./models/Report");
const Overtime = require("./models/Overtime");
const Employee = require("./models/employee");
const Attendance = require("./models/attendance");
const User = require("./models/User"); // ✅ IMPORTANT

const app = express();
const port = process.env.PORT || 8000;
const host = process.env.HOST || "0.0.0.0";

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* ---------- MongoDB ---------- */
mongoose
  .connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ---------- Server ---------- */
app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});

/* ---------- AUTH ---------- */

// Register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({ name, email, password });

    const token = jwt.sign(
      { id: user._id },
      "secretKey",
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Register error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      "secretKey",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

/* ---------- EMPLOYEES ---------- */

app.post("/addEmployee", async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: "Failed to add employee" });
  }
});

app.get("/employees", async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

/* ---------- ATTENDANCE ---------- */

app.post("/attendance", async (req, res) => {
  const { employeeId, date } = req.body;

  const existing = await Attendance.findOne({ employeeId, date });

  if (existing) {
    Object.assign(existing, req.body);
    await existing.save();
    return res.json(existing);
  }

  const attendance = new Attendance(req.body);
  await attendance.save();
  res.json(attendance);
});

app.get("/attendance", async (req, res) => {
  const { date } = req.query;
  const data = await Attendance.find({ date });
  res.json(data);
});

/* ---------- REPORTS ---------- */

app.post("/reports", async (req, res) => {
  const report = new Report(req.body);
  await report.save();
  res.json({ message: "Report saved" });
});

app.get("/reports", async (req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 });
  res.json(reports);
});

/* ---------- OVERTIME ---------- */

app.post("/overtime", async (req, res) => {
  const overtime = new Overtime(req.body);
  await overtime.save();
  res.status(201).json({ message: "Overtime saved" });
});

app.get("/overtime", async (req, res) => {
  try {
    const data = await Overtime.find().sort({ date: -1 }); 
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching overtime reports", error: err });
  }
});


