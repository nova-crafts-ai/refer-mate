import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import profileRouter from "./routes/profileRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import threadRoutes from "./routes/threadRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { requireAuth } from "./middlleware/requireAuth.js";
import { errorHandler, notFoundHandler } from "./middlleware/errorHandler.js";
import { rateLimiter } from "./middlleware/ratelimiter.js";
configDotenv();

const PORT = process.env.PORT;
const app = express();

// Use Middlewares
app.use(clerkMiddleware({ debug: process.env.NODE_ENV === "development" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// TODO : update cors
app.use(cors({}));

// Routers
app.use("/auth", authRoutes);
app.use("/profile", requireAuth, rateLimiter, profileRouter);
app.use("/threads", requireAuth, rateLimiter, threadRoutes);
app.use("/messages", requireAuth, rateLimiter, messageRoutes);
app.get("/", (_, res) => {
  res.send("Server running");
});

// 404 handler for undefined routes (must be after all route definitions)
app.use(notFoundHandler);

// Global error handler (must be the last middleware)
app.use(errorHandler);

// Start the server
app.listen(PORT, (error) => {
  if (error) {
    console.log("We ran into an error", error);
  } else {
    console.log(`Running on ${PORT}`);
  }
});
