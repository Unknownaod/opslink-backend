import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// ROUTES
import authRoutes from "./routes/auth.js";
import communityRoutes from "./routes/community.js";
import departmentRoutes from "./routes/departments.js";
import civilianRoutes from "./routes/civilians.js";
import billingRoutes from "./routes/billingRoutes.js";
import mdtRoutes from "./routes/mdt.js";
import unitRoutes from "./routes/units.js";
import callRoutes from "./routes/calls.js";
import boloRoutes from "./routes/bolos.js";
import searchRoutes from "./routes/search.js";
import trafficRoutes from "./routes/traffic.js";

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
app.use("/billing", billingRoutes);
app.use("/mdt", mdtRoutes);

export default app;





