import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import Razorpay from "razorpay";

config({ path: '.env.local' }); //or .env.local

// Database configuration
const client = postgres(process.env.DATABASE_URL || "");
export const db = drizzle({ client });

// Razorpay configuration
const keyId = process.env.RAZORPAY_KEY_ID?.trim();
const secret = process.env.RAZORPAY_SECRET?.trim();

console.log('Razorpay Credentials Check:', {
  keyIdLength: keyId?.length,
  keyIdStart: keyId?.substring(0, 8),
  secretLength: secret?.length,
  isTestKey: keyId?.startsWith('rzp_test_')
});

if (!keyId || !secret) {
  throw new Error('Razorpay credentials are missing');
}

if (!keyId.startsWith('rzp_test_')) {
  throw new Error('Invalid Razorpay key format. Test key should start with rzp_test_');
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: secret
});





