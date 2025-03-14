require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", messageRoutes);

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Check if JWT_SECRET is loaded correctly
if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is not defined. Check your .env file.");
    process.exit(1);
}

// ✅ Socket.IO for Real-time Chat
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
    console.log("🟢 A user connected:", socket.id);

    socket.on("sendMessage", (data) => {
        console.log("📩 Message received:", data);
        io.emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
    });
});

// ✅ Start Server
const PORT = process.env.PORT || 5006;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
