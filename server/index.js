import "dotenv/config";
import express from 'express';
import { connectDb } from './database/db.js';
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import aiRoutes from "./routes/ai.js";
import Razorpay from 'razorpay';
import cors from 'cors';

export const instance=new Razorpay({
    key_id:process.env.Razorpay_Key,
    key_secret:process.env.Razorpay_Secret,

});
console.log("💲💲 Razorpay is working");

const app = express();

// ✅ ADD HERE (important)
app.set("trust proxy", 1);

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("Welcome server is working successfully ");
});

app.get('/health', (req, res) => {
    res.json({ status: "ok" });
});

app.use('/uploads', express.static("uploads"));

// Using routes
app.use('/api', userRoutes);
app.use('/api', courseRoutes);
app.use('/api', adminRoutes);
app.use('/api', aiRoutes);

const port = process.env.PORT || 5000;

app.listen(port, async () => {
    console.log(`👍👍 Server is running on http://localhost:${port}`);
    await connectDb();
});

//bceaeb61-4839-4a07-b9db-0b41346908a5