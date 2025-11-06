import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import corsMiddleware from "./configs/cors.config.js";
import mongoDbConnect from "./configs/mongoose.connect.js";
import userRouter from "./routes/user.route.js";
import timeSheetRouter from "./routes/timesheet.route.js";
import loginRouter from "./routes/login.route.js";
dotenv.config({quiet:true});
const app = express();
const PORT = process.env.PORT;
const URL = process.env.URL;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

app.use('/api/admin',userRouter);
app.use('/api/login',loginRouter);
app.use('/api/timesheet',timeSheetRouter);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await mongoDbConnect(URL);
});
