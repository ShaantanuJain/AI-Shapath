import express from "express";
import { ConversationCategory } from "../models/ConversationCategories";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import type { Request, Response } from "express";

const router = express.Router();

// Get all categories
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

// Get one category by ID
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

// Create a new category
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { name, description, prompt, redirectableToOtherCategory } =
        req.body;
      const newCategory = new ConversationCategory({
        name,
        description,
        prompt,
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

// Update a category
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { name, description, prompt, redirectableToOtherCategory } =
        req.body;
      const updatedCategory = await ConversationCategory.findByIdAndUpdate(
        req.params.id,
        { name, description, prompt, redirectableToOtherCategory },
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

// Delete a category
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
