import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// ROUTES
import authRoutes from "./routes/auth.js";
import communityRoutes from "./routes/community.js";
import departmentRoutes from "./routes/departments.js";
import unitRoutes from "./routes/units.js";
import civilianRoutes from "./routes/civilians.js";
import callRoutes from "./routes/calls.js";
import searchRoutes from "./routes/search.js";

dotenv.config();
connectDB();

const app = express();

// CORS (safe anywhere)
app.use(cors());

// ❌ REMOVE express.json() — this breaks Stripe webhook
// app.use(express.json());

// 👍 Let server.js handle JSON AFTER the webhook

// Base API routes (these will get JSON parsing from server.js)
app.use("/auth", authRoutes);
app.use("/community", communityRoutes);
app.use("/departments", departmentRoutes);
app.use("/units", unitRoutes);
app.use("/civilians", civilianRoutes);
app.use("/calls", callRoutes);
app.use("/search", searchRoutes);

export default app;
