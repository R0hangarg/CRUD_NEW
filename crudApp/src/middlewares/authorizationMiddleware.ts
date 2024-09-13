import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../Interfaces/userInterface";

// Controller to check authorization of user after checking whether it is authenticated or not. 
export const isAuthorization = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = res.locals.user?.role; // Assuming user info is attached to req.user

    if (!userRole) {
        return res.status(401).json({
            status: false,
            message: 'User is not authenticated. Please log in.',
            data: null,
            error: null
        });
    }

    try {

        if (userRole === "admin") {
            return next();
        } else {
            return res.status(403).json({
                status: false,
                message: 'Access denied. You do not have the required permissions.',
                data: null,
                error: null
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'An error occurred while checking user permissions.',
            data: null,
            error: error
        });
    }
};