const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// POST /api/auth/verify-token
router.post("/verify-token", authController.verifyToken);

// GET /api/auth/callback (Lazada Callback)
router.get("/callback", authController.lazadaCallback);

module.exports = router;
