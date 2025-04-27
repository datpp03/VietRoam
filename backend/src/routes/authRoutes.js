const express = require("express");
const router = express.Router();
const authController = require("../app/controllers/authController");

router.post("/auth/google", authController.googleLogin);

module.exports = router;