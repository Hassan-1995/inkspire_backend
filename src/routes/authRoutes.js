const express = require("express");
const passport = require("passport");

const router = express.Router();

// Start Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ message: "Logout failed." });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Session destruction failed." });
      }

      res.clearCookie("connect.sid"); // default cookie name for express-session
      return res.status(200).json({ message: "Logged out successfully." });
    });
  });
});

// Handle callback from Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure",
  })
);

// Success page
router.get("/google/success", (req, res) => {
  res.json({
    message: "Google OAuth successful",
    user: req.user,
  });
});

// Failure page
router.get("/google/failure", (req, res) => {
  res.status(401).json({ message: "Google OAuth failed" });
});

module.exports = router;
