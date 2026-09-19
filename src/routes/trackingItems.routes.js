const express = require("express");
const controller = require("../controllers/trackingItems.controller");

const router = express.Router();

router.post("/", controller.create); // POST /api/tracking-items
router.get("/", controller.list); // GET  /api/tracking-items?userId=...
router.delete("/:id", controller.remove); // DELETE /api/tracking-items/:id

module.exports = router;
