import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../lib/types/middleware";

export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
