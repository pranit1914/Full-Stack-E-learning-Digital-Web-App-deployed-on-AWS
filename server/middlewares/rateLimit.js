import { loginLimiter, registerLimiter } from "../utils/rateLimiter.js";

// LOGIN limiter middleware
export const loginRateLimit = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"] || "anonymous";

    const { success } = await loginLimiter.limit(ip);

    if (!success) {
      return res.status(429).json({
        message: "Too many login attempts. Try again later.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Rate limiter error",
    });
  }
};

// REGISTER limiter middleware
export const registerRateLimit = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"] || "anonymous";

    const { success } = await registerLimiter.limit(ip);

    if (!success) {
      return res.status(429).json({
        message: "Too many OTP requests. Try again later.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Rate limiter error",
    });
  }
};