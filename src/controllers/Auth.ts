import { db } from "../db/index.ts";
import {usersTable as users} from "../db/schema.ts"
import {eq} from "drizzle-orm";
import {config} from "dotenv";
import bcrypt from "bcrypt";
import jwt, { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import {generateAccessToken, generateRefreshToken} from "../utils/generateToken.ts";
import { generateOtp, verifyOtp } from "./Otp.ts";

interface AuthenticatedRequest extends Request {
  user?: any; // You can replace 'any' with a more specific type for your user
}

config({path: ".env.local"})

// logic for SIGN UP
export const signUp = async (req: Request,res:Response) => {
    try{
   //fetch details
   const {name,email,password} = req.body as {name: string, email: string, password: string};
   //validate data
   if(!name || !email || !password){
     res.status(400).json({
        success: false,
        message: "Fill the details properly",
     });return;
     
    }
    // check if user has already signed up 
    const existingUser = await db.select().from(users).where(eq(users.email,email));

    if(existingUser.length > 0){
         res.status(400).json({
          success: false,
          message: "User already exists"  
        });
         return;
    };
    // if user doesn't exists hash the password
    const hashedPassword = await bcrypt.hash(password,10);
     
    // now create an entry in DB
   const newUser = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
    verified: false ,
   }).returning();

   const response  = await fetch(`${process.env.HOST_URL}/api/v1/otp/generate`,
    {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if(!data.success) {
      res.status(200).json({
        success: false,
        message: data.message
      });
      return;
    }

   //  response
    res.status(200).json({
      success: true,
      message: "User registered successfully",
      user: newUser[0],
    });
    return;
   }catch(error){
        console.log(error);
         res.status(500).json({
           success: false,
           message: "Internal Server error"
        });return;
    }
}


// logic for LOGIN 
export const login = async (req: Request, res: Response) => {
    try{
    // fetch the data    
    const {email,password} = req.body;
    console.log(email, password)
    // validate details
    if(!email || !password){
         res.status(400).json({
           success: false,
           message: "Fill the details properly",
        });
        return;
    }
    // check if user exists or not
    const user = await db.select().from(users).where(eq(users.email,email));
    if(!user.length){
        res.status(404).json({ message: "User not found" });
        return;
    }
    // if user found then check the password 
    const match = await bcrypt.compare(password,user[0].password);
    if(!match){
         res.status(401).json({
            success: false,
            message: "Invalid Credentials"
        });
        return;
    }
    
    const accessToken = generateAccessToken(user[0].id, user[0].email);
    const refreshToken = generateRefreshToken(user[0].id);

    await db.update(users).set({ refreshToken }).where(eq(users.id, user[0].id));

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,  
    });return;

    }catch(error){
     console.log(error);
      res.status(500).json({
        success: false,
        message: "Internal Server error"
     });return;
    }
} 

// logic for Forgot Password Request (Using OTP)
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
      const { email } = req.body;

      if (!email) {
          res.status(400).json({ success: false, message: "Email is required" });
          return;
      }

      // Check if the user exists
      const userRecord = await db.select().from(users).where(eq(users.email, email));
      if (!userRecord.length) {
          res.status(404).json({ success: false, message: "User not found" });
          return;
      }

      // Generate OTP for password reset
      await generateOtp(req, res);  // Call the existing generateOtp function
      return;

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
      return;
  }
};  
 // logic for resetting password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
        return;
    }

    const response  = await fetch(`${process.env.HOST_URL}/api/v1/otp/verify`,
    {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
      
    if (!data.success) {
        res.status(response.status).json({
            success: false,
            message: data.message,
        }); return ;
    }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password in the database
      await db.update(users).set({ password: hashedPassword }).where(eq(users.email, email));

      res.status(200).json({ success: true, message: "Password has been reset successfully" });
      return;

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
      return;
  }
};

//  logic for refresh token

export const refreshToken = async(req: Request, res: Response): Promise<void> =>{
    try{
   // fetch the token
   const{token} = req.body;
   //validate it
   if(!token){
     res.status(401).json({
        success: false,
        message: "Unauthorised",
    });return
    ;}
    // verify the token
    let decoded: any;
    try{
    decoded = jwt.verify(token,process.env.REFRESH_SECRET || "refresh_secret");
    }catch(error){
        res.status(403).json({
            success: false,
            message: "Invalid refresh token"
        });
        return ;
     }
      // Fetch user from the database using the decoded ID
      const user = await db.select().from(users).where(eq(users.id, decoded.id));
      console.log("Received Refresh Token:", token);
      console.log("User from DB:", user);
      // Check if user exists
      if (!user.length) {
         res.status(404).json({
              success: false,
              message: "User not found",
          });
           return;
      };
       // Check if the stored refresh token matches
       if (user[0].refreshToken !== token) {
        res.status(403).json({
            success: false,
            message: "Refresh token does not match",
        });
        return;
    };
     //generate a new access token
     const newAccessToken = generateAccessToken(decoded.id, user[0].email)
   res.status(200).json({ success: true, accessToken: newAccessToken });return;
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal Server Error" });
      return;
    }
  };

  // logic for  logout
  export const logout = async (req: Request, res: Response): Promise<void>  => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
             res.status(400).json({ success: false, message: "Refresh token required" });
             return;
        }

        // Check if the token exists
        const user = await db.select().from(users).where(eq(users.refreshToken, refreshToken));
        if (!user.length) {
             res.status(404).json({ success: false, message: "User not found" });
             return;
        }

        // Remove refresh token from database
        await db.update(users).set({ refreshToken: null }).where(eq(users.id, user[0].id));

         res.status(200).json({ success: true, message: "Logged out successfully" });
         return;

    } catch (error) {
        console.error(error);
         res.status(500).json({ success: false, message: "Internal Server Error" });
         return;
    }
};

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed: No token provided",
            });
        }

        const token = authHeader.split(" ")[1];
        
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed: Invalid token",
        });
    }
};
