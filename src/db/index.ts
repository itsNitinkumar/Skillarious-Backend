import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import Razorpay from "razorpay";

config({ path: '.env.local' }); //or .env.local

// Database configuration
const client = postgres(process.env.DATABASE_URL || "");
export const db = drizzle({ client });

// Razorpay configuration
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_SECRET must be defined in environment variables');
}

// Add this logging to debug the credentials
console.log('Initializing Razorpay with:', {
  keyId: process.env.RAZORPAY_KEY_ID?.substring(0, 4) + '...',
  secretLength: process.env.RAZORPAY_SECRET?.length,
  keyIdLength: process.env.RAZORPAY_KEY_ID?.length
});

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID.trim(),
  key_secret: process.env.RAZORPAY_SECRET.trim()
});





