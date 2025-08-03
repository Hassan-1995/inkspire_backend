// routes/stripeRoutes.js
const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/paymentGatewayController");

router.post("/checkout", stripeController.handleCheckout);

module.exports = router;
