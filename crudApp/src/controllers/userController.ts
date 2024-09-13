import { Request, Response } from "express";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs'
import { loginValidations, userValidation } from "../validations/userValidations";
import { userType } from "../Interfaces/userInterface";


//Create new User
export const registerUser = async (req: Request, res: Response) => {
    try {
        const user: userType = await userValidation.validateAsync(req.body);

        const userCheck = await User.findOne({
            username: user.username,
            email: user.email,
        });

        if (userCheck) {
            return res.status(409).json({
                status: false,
                message: "User Already Exits !!!",
                data: null,
                error: null
            });
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = new User({
            username: user.username,
            password: hashedPassword,
            role: user.role,
            email: user.email,
            phone: user.phone
        });

        const savedUser = await newUser.save();

        res.status(200).json({
            status: true,
            message: "User registered successfully",
            data: savedUser,
            error: null
        })
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            status: false,
            message: "An error occurred while creating user.",
            data: null,
            error: error
        });
    }
}

//login User through username and password
export const loginUser = async (req: Request, res: Response) => {
    try {
        const JWT_SECRET = process.env.JWT_SECRET || "your-JWT-SecretKey";
        const { username, password } = await loginValidations.validateAsync(req.body);

        const userCheck = await User.findOne({
            username: username
        });

        if (!userCheck) {
            return res.status(404).json({
                status: false,
                message: "No such user found please Register first",
                data: null,
                error: null
            })
        }

        const isMatch = await bcrypt.compare(password, userCheck.password)

        if (!isMatch) {
            return res.status(400).json({
                status: false,
                message: "Incorrect password",
                data: null,
                error: null
            });
        }

        const payload = {
            username: username,
            role: userCheck.role, // Include role in token payload
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true, // JavaScript can't access the cookie
            maxAge: 3600000, // Cookie expiration time (1 hour in milliseconds)
            sameSite: 'strict' // Prevent CSRF attacks
        }).status(200).json({
            status: true,
            message: "Loggin user successfully",
            data: token,
            error: null,
            role: userCheck.role
        });

    } catch (error) {
        console.error("Error Logging user:", error);
        res.status(500).json({
            status: false,
            message: "An error occurred while logging user.",
            data: null,
            error: error
        });
    }
}

//logout user 
export const logOutUser = async (req: Request, res: Response) => {
    res.clearCookie('token'); // Clear the cookie with the name 'authToken'
    res.status(200).json({ message: 'Logged out successfully' });
}