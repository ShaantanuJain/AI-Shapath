import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { authenticateToken } from "../middleware/auth";
import type { Request, Response } from "express";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

const registerhandler = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Register new user
router.post("/register", registerhandler);

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
});

// Get current user
router.get(
  "/me",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findById(req.user?.userId).select("-password");
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      console.log(user?.isAdmin);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user data" });
    }
  },
);
export default router;
