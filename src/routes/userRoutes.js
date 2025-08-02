const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

// GET /api/users
router.get("/users", userController.getAllUsers);

// POST /api/user
router.post("/user", userController.createUser); // user-registration
router.post("/user/login", userController.loginUser); //user-login
// router.put("/user-contact", userController.updateUserContact); //user-address+contact
router.put("/user-contact", verifyToken, userController.updateUserContact); //user-address+contact
router.get(
  "/delivery-info/check",
  verifyToken,
  userController.checkDeliveryInfo
); //checking user-address+contact
router.get("/user-contact", verifyToken, userController.getUserContact); //user-address+contact

module.exports = router;
