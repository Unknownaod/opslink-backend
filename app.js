import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// ROUTES
import authRoutes from "./routes/auth.js";
import communityRoutes from "./routes/community.js";
import departmentRoutes from "./routes/departments.js";
import unitRoutes from "./routes/units.js";
import civilianRoutes from "./routes/civilians.js"; // (placeholder for now)
import callRoutes from "./routes/calls.js";
import searchRoutes from "./routes/search.js"; // <-- NEW

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ====== BASE ROUTES ======
app.use("/auth", authRoutes);
app.use("/community", communityRoutes);
app.use("/departments", departmentRoutes);
app.use("/units", unitRoutes);
app.use("/civilians", civilianRoutes);
app.use("/calls", callRoutes);
app.use("/search", searchRoutes);   // <-- NEW (MDT needs this)

export default app;
