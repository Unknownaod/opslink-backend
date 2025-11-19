import http from "http";
import { Server } from "socket.io";
import app from "./app.js";

// Health endpoints
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

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// Attach io to req BEFORE routes run
app.use((req, res, next) => {
  req.io = io;
  next();
});

// =============================
// SOCKET HANDLERS
// =============================
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // UNIT STATUS
  socket.on("unit:status", (data) => {
    io.emit("unit:status", data);
  });

  // UNIT LOCATION
  socket.on("unit:location", (data) => {
    io.emit("unit:location", data);
  });

  // FORCE 10-7 / forced logout
  socket.on("unit:forceOffline", (data) => {
    io.emit("unit:forceOffline", data);
  });

  // PANIC BUTTON
  socket.on("unit:panic", (data) => {
    io.emit("unit:panic", data);
  });

  // CALL UPDATES
  socket.on("call:update", (data) => {
    io.emit("call:update", data);
  });
});

// =============================
// START SERVER
// =============================
server.listen(PORT, () => {
  console.log(`🚀 OpsLink API running on port ${PORT}`);
});
