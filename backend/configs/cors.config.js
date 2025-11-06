// cors.config.js
import cors from "cors";

const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // Disable credentials since "*" origin is used
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
