const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// GET /api/users
router.get("/users", userController.getAllUsers);

// POST /api/user
router.post("/user", userController.createUser);
router.post("/user/login", userController.loginUser);
router.put("/user-contact", userController.updateUserContact);

module.exports = router;
