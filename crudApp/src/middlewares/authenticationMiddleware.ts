import { AuthenticatedRequest } from "../Interfaces/userInterface";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

// Controller to check authentication of user 
export const isAuthenicated = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const JWT_SECRET = process.env.JWT_SECRET || "your-JWT-SecretKey";
        const token = req.cookies['token'] || req.headers['authorization']?.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };;
        console.log(decoded)
        if (!decoded) {
            return res.status(400).json({
                status: false,
                message: "login First",
                data: null,
                error: null
            })
        }

        res.locals.user = { role: decoded.role, username: decoded.username }
        next();
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "An error occurred while logging user.",
            data: null,
            error: error,
        });
    }
}