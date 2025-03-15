import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoute from "./src/routes/auth.ts";
import otpRoute from "./src/routes/otp.ts";
import courseRoute from "./src/routes/course.ts";
import paymentRoute from "./src/routes/payment.ts";
import reviewRoute from "./src/routes/review.ts";
import educatorRoute from "./src/routes/educator.ts";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/otp", otpRoute);
app.use("/api/v1/courses", courseRoute);
app.use("/api/v1/payments", paymentRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/educators", educatorRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
});


