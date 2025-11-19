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

io.on("connection", (socket) => {
  console.log("🟢 Socket Connected:", socket.id);

  socket.on("unit:update", (data) => {
    io.emit("unit:update", data);
  });

  socket.on("call:update", (data) => {
    io.emit("call:update", data);
  });
});

server.listen(PORT, () => console.log(`🚀 OpsLink API running on port ${PORT}`));
