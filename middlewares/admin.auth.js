import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';


export const adminAuth = (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded.isAdmin ) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        req.auth = decoded;
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid token." });
    }
};
