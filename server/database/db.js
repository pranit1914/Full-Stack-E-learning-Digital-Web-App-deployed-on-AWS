import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Database is Connected Successfully");
    } catch (error) {
        console.error("❌ Database Connection Error:", error.message);
        process.exit(1);
    }
};