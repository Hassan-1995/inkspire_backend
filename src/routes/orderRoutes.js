// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/orders/create", verifyToken, orderController.createOrder);
router.get("/orders/all", orderController.getAllOrders);
// router.get("/orders/user/:userID", orderController.getOrdersByUserID);
router.get("/orders/user", verifyToken, orderController.getOrdersByUserID);

module.exports = router;
