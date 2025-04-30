// authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../app/controllers/authController");

router.post("/google-login", authController.googleLogin);
router.get("/verify", authController.verifyToken);

module.exports = router;