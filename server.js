import http from "http";
import { Server } from "socket.io";
import app from "./app.js";

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

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// ====== SOCKET LOGIC (ONLY ONCE!) ======
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // UNIT STATUS UPDATE
  socket.on("unit:status", (data) => {
    io.emit("unit:status", data);
  });

  // CALL UPDATE
  socket.on("call:update", (data) => {
    io.emit("call:update", data);
  });

  // PANIC BUTTON
  socket.on("panic:button", (data) => {
    io.emit("panic:button", data);
  });
});

// ====== START SERVER ======
server.listen(PORT, () => {
  console.log(`🚀 OpsLink API running on port ${PORT}`);
});
