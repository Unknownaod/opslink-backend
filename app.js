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
import billingRoutes from "./routes/billingRoutes.js";

dotenv.config();
connectDB();

const app = express();

// CORS
app.use(cors());

// ✅ JSON PARSER (MUST BE HERE)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ROUTES
app.use("/auth", authRoutes);
app.use("/community", communityRoutes);
app.use("/departments", departmentRoutes);
app.use("/units", unitRoutes);
app.use("/civilians", civilianRoutes);
app.use("/calls", callRoutes);
app.use("/search", searchRoutes);

export default app;

