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

// ❌ DO NOT PUT express.json() HERE
// It would break Stripe webhook

// Base API routes (JSON will be applied in server.js)
app.use("/auth", authRoutes);
app.use("/community", communityRoutes);
app.use("/departments", departmentRoutes);
app.use("/units", unitRoutes);
app.use("/civilians", civilianRoutes);
app.use("/calls", callRoutes);
app.use("/search", searchRoutes);

export default app;
