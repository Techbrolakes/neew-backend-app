import Redis from "ioredis";

const redis = new Redis({
  host: "127.0.0.1", // Redis host
  port: 6379, // Redis port
});

export const CACHE_TTL = 3600; // Cache expiry time in seconds (1 hour)

export default redis;
