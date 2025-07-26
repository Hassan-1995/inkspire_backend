require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./src/config/passport");

const app = express();
const PORT = process.env.PORT || 5000;

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require("./src/routes/userRoutes");
app.use("/api", userRoutes);

const authRoutes = require("./src/routes/authRoutes");
app.use("/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "API is running" });
});

// Error handling (optional middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
