import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use("/admin", adminRoutes);
app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.send("In-app Messaging API")
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});