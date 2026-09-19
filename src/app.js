const express = require("express");
const cors = require("cors");
const trackingItemsRoutes = require("./routes/trackingItems.routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tracking-items", trackingItemsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
