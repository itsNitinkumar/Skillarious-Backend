import jwt from "jsonwebtoken"

const ACCESS_SECRET = process.env.JWT_SECRET || "access secret"
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh secret"

 export const generateAccessToken = (userId: string , email: string) => {
    const payload = {id: userId ,email};
    return jwt.sign(payload, ACCESS_SECRET,{expiresIn: "50d"});
} ;

export const generateRefreshToken = (userId:string) => {
    const payload = {id: userId};
    return jwt.sign(payload, REFRESH_SECRET, {expiresIn: "1000d"});
};

  