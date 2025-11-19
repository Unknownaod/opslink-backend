import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import cors from "cors";

// ========================
// 🔧 REQUIRED CORS CONFIG
// ========================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Fix OPTIONS preflight globally (Render requires this)
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return res.sendStatus(200);
});

// Render health check
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "OpsLink API is running successfully.",
    uptime: process.uptime()
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

// Create HTTP server
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// SOCKET.IO SERVER
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Attach io BEFORE routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// SOCKET.IO EVENTS
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("unit:status", (d) => io.emit("unit:status", d));
  socket.on("unit:location", (d) => io.emit("unit:location", d));
  socket.on("unit:forceOffline", (d) => io.emit("unit:forceOffline", d));
  socket.on("unit:panic", (d) => io.emit("unit:panic", d));
  socket.on("call:update", (d) => io.emit("call:update", d));

  socket.on("disconnect", () =>
    console.log("🔴 Socket disconnected:", socket.id)
  );
});

// START SERVER
server.listen(PORT, () => {
  console.log(`🚀 OpsLink API running on port ${PORT}`);
});

