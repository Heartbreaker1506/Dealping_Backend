const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyAuth } = require("../middlewares/authMiddleware");

// PATCH /api/users/unlock-slot-2 (Hoặc POST đều được)
router.patch("/unlock-slot-2", verifyAuth, userController.unlockSlot2);
router.post("/unlock-slot-2", verifyAuth, userController.unlockSlot2);

module.exports = router;
