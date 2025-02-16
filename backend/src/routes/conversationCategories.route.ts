import express from "express";
import { ConversationCategory } from "../models/ConversationCategories";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import type { Request, Response } from "express";

const router = express.Router();

// --------------------------
// Public route (non-admin)
// --------------------------
router.get(
  "/public",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // Return only fields that the frontend needs
      const categories = await ConversationCategory.find(
        {},
        "_id name description icon imageUrl gradient textColor",
      );
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get categories" });
    }
  },
);

// --------------------------
// Admin protected routes
// --------------------------
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const categories = await ConversationCategory.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get categories" });
    }
  },
);

// Get one category by ID (admin)
router.get(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const category = await ConversationCategory.findById(req.params.id);
      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to get the category" });
    }
  },
);

// Create a new category (admin)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const {
        name,
        description,
        prompt,
        icon,
        imageUrl,
        gradient,
        textColor,
        redirectableToOtherCategory,
      } = req.body;
      const newCategory = new ConversationCategory({
        name,
        description,
        prompt,
        icon,
        imageUrl,
        gradient,
        textColor,
        redirectableToOtherCategory,
      });
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to create category" });
    }
  },
);

// Update a category (admin)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const {
        name,
        description,
        prompt,
        icon,
        imageUrl,
        gradient,
        textColor,
        redirectableToOtherCategory,
      } = req.body;
      const updatedCategory = await ConversationCategory.findByIdAndUpdate(
        req.params.id,
        {
          name,
          description,
          prompt,
          icon,
          imageUrl,
          gradient,
          textColor,
          redirectableToOtherCategory,
        },
        { new: true },
      );
      if (!updatedCategory) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
      res.json(updatedCategory);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to update category" });
    }
  },
);

// Delete a category (admin)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const deletedCategory = await ConversationCategory.findByIdAndDelete(
        req.params.id,
      );
      if (!deletedCategory) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  },
);

export default router;
