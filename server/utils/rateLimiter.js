import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// connect redis
const redis = new Redis({
  url: "https://patient-possum-101903.upstash.io",  // ✅ string
  token: "gQAAAAAAAY4PAAIocDJmYWM5YmE4OWUwOTM0MjhkODU2OGY4NzhkYThmZjYxZXAyMTAxOTAz", // ✅ string
});

console.log("👍👍 Redis working correctly");

//console.log("URL:", url); 
//console.log("TOKEN:", token);

// limiter for login
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

// limiter for register
export const registerLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});