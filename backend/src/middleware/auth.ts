import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
	user?: { userId: string };
}

export const authenticateToken = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		res.status(401).json({ error: "Access denied" });
		return;
	}

	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET as string);
		req.user = verified as { userId: string };
		next();
	} catch (error) {
		res.status(403).json({ error: "Invalid token" });
	}
};
