import crypto from "crypto";
import {NextFunction, Request,Response} from "express";
import {db} from "../db/index.ts";
import {otpsTable as otps, usersTable} from "../db/schema.ts";
import {sendEmail} from "../utils/sendEmail.ts";
import {eq} from "drizzle-orm";
import {desc} from "drizzle-orm";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.ts";

// we will generate otp through RLC6238TOTP
// --------------------------------------------------------------------------------
// generating the otp
export const generateOtp = async(req: Request, res: Response): Promise<void>  => {
    try{
        const{email} =req.body;
        console.log(' email --> ', email);
        if(!email){
             res.status(400).json({
                succcess:false,
                message: "Email is required"
            });
            return;
        }
        const otp = crypto.randomInt(100000,999999);
        const expiry = new Date(Date.now() + 2*60*1000);

        //store in db
        await db.insert(otps).values({
            id: crypto.randomUUID(),
            value: BigInt(otp),
            email,
            expiry,
            lastSent: new Date(), // Add the missing lastSent field
        });

        //send otp via mail
        await sendEmail(email, "Your OTP Code", `Your OTP is ${otp}. It is valid for 2 minutes.`)
        res.status(200).json({ success: true, message: "OTP sent successfully",otp });
        return;
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        return;
    };
    return;
}

// otp verification
export const verifyOtp = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, otp } =  req.body;
        if (!email || !otp) {
            res.status(400).json({success: false, message: "Email and OTP are required"})
            return;
        }
        
        // Fetch OTP from DB
        const otpRecord = await db.select().from(otps).where(eq(otps.email, email)).orderBy(desc(otps.expiry)).limit(1);
        
        if (!otpRecord.length) {
            res.status(404).json({success: false, message: "OTP not found"})
            return ;
        }

        const { value, expiry } = otpRecord[0];

        if (BigInt(value) !== BigInt(otp.trim()) || new Date() > expiry) {
            res.status(400).json({ success: false, message: "Invalide or expried otp" });
            return ;
        }

        await db.update(usersTable).set({verified : true}).where(eq(usersTable.email, email));

        await db.delete(otps).where(eq(otps.email, email));
        
        const [user] = await db.select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }

        const accessToken = generateAccessToken(user.id, user.email);
        const refreshToken = generateRefreshToken(user.id);
    
        await db.update(usersTable).set({ refreshToken }).where(eq(usersTable.id, user.id));
    
        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            accessToken,
            refreshToken,  
        });return;


    } catch (error) {
        console.log('nitin\'s error -> ', error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
    return;
};



