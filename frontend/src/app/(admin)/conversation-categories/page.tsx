"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

interface ConversationCategory {
  _id: string;
  name: string;
  description: string;
  prompt: string;
  icon?: string;
  gradient?: string;
  textColor?: string;
  redirectableToOtherCategory: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ConversationCategory[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Form state for creating a new category
  const [form, setForm] = useState({
    name: "",
    description: "",
    prompt: "",
    icon: "",
    gradient: "",
    textColor: "",
    redirectableToOtherCategory: false,
  });

  // Editing state for updating existing category
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingData, setEditingData] = useState<{
    name: string;
    description: string;
    prompt: string;
    icon: string;
    gradient: string;
    textColor: string;
    redirectableToOtherCategory: boolean;
  }>({
    name: "",
    description: "",
    prompt: "",
    icon: "",
    gradient: "",
    textColor: "",
    redirectableToOtherCategory: false,
  });

  const { user, token, error: authError } = useAuth();
  const router = useRouter();

  // Ensure only admins can access this page
  useEffect(() => {
    if (!user && authError) {
      router.push("/");
    }
    if (user) {
      if (!("isAdmin" in user) || !user.isAdmin) {
        router.push("/");
      }
    }
  }, [user, router, authError]);

  const fetchCategories = async () => {
    try {
      const data = await apiFetch<ConversationCategory[]>("/api/categories", {
        token: token ?? undefined,
      });
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token) fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    formType: "create" | "edit" = "create",
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      if (formType === "create") {
        setForm((prev) => ({ ...prev, [name]: target.checked }));
      } else {
        setEditingData((prev) => ({ ...prev, [name]: target.checked }));
      }
    } else {
      if (formType === "create") {
        setForm((prev) => ({ ...prev, [name]: value }));
      } else {
        setEditingData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await apiFetch("/api/categories", {
        method: "POST",
        token: token ?? undefined,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({
        name: "",
        description: "",
        prompt: "",
        icon: "",
        gradient: "",
        textColor: "",
        redirectableToOtherCategory: false,
      });
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/categories/${id}`, {
        method: "DELETE",
        token: token ?? undefined,
      });
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdate = async (
    id: string,
    updatedData: Partial<ConversationCategory>,
  ) => {
    try {
      await apiFetch(`/api/categories/${id}`, {
        method: "PUT",
        token: token ?? undefined,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      fetchCategories();
      setEditingCategoryId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Called when "Edit" is clicked for a given category
  const startEditing = (category: ConversationCategory) => {
    setEditingCategoryId(category._id);
    setEditingData({
      name: category.name,
      description: category.description,
      prompt: category.prompt,
      icon: category.icon || "",
      gradient: category.gradient || "",
      textColor: category.textColor || "",
      redirectableToOtherCategory: category.redirectableToOtherCategory,
    });
  };

  // Called when the editing is cancelled
  const cancelEditing = () => {
    setEditingCategoryId(null);
  };

  // Called when the editing form is submitted
  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategoryId) {
      await handleUpdate(editingCategoryId, editingData);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        Admin: Manage Conversation Categories
      </h1>
      {error && <p className="text-red-500">{error}</p>}

      <Card className="p-4 mb-8">
        <h2 className="text-xl font-semibold mb-2">Create New Category</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block">Name</label>
            <Input
              name="name"
              value={form.name}
              onChange={(e) => handleChange(e, "create")}
              required
            />
          </div>
          <div>
            <label className="block">Description</label>
            <Input
              name="description"
              value={form.description}
              onChange={(e) => handleChange(e, "create")}
              required
            />
          </div>
          <div>
            <label className="block">Prompt</label>
            <textarea
              name="prompt"
              className="w-full p-2 border rounded"
              value={form.prompt}
              onChange={(e) => handleChange(e, "create")}
              required
            ></textarea>
          </div>
          <div>
            <label className="block">
              Icon (e.g., MessageCircle, Brain, etc.)
            </label>
            <Input
              name="icon"
              value={form.icon}
              onChange={(e) => handleChange(e, "create")}
              placeholder="Icon name"
            />
          </div>
          <div>
            <label className="block">Gradient (CSS classes)</label>
            <Input
              name="gradient"
              value={form.gradient}
              onChange={(e) => handleChange(e, "create")}
              placeholder="e.g., bg-gradient-to-r from-[#5CA9E9] to-white"
            />
          </div>
          <div>
            <label className="block">Text Color (CSS classes)</label>
            <Input
              name="textColor"
              value={form.textColor}
              onChange={(e) => handleChange(e, "create")}
              placeholder="e.g., text-[#00264D]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="create-redirect">
              Redirectable to other category?
            </label>
            <Input
              id="create-redirect"
              name="redirectableToOtherCategory"
              type="checkbox"
              checked={form.redirectableToOtherCategory}
              onChange={(e) => handleChange(e, "create")}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Category"}
          </Button>
        </form>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Existing Categories</h2>
        {categories.length === 0 ? (
          <p>No categories available.</p>
        ) : (
          <ul className="space-y-4">
            {categories.map((cat) => (
              <li
                key={cat._id}
                className="p-4 border rounded flex flex-col gap-2"
              >
                {editingCategoryId === cat._id ? (
                  // Edit mode: Show a form for editing all fields.
                  <form onSubmit={submitEdit} className="space-y-2">
                    <div>
                      <label className="block">Name</label>
                      <Input
                        name="name"
                        value={editingData.name}
                        onChange={(e) => handleChange(e, "edit")}
                        required
                      />
                    </div>
                    <div>
                      <label className="block">Description</label>
                      <Input
                        name="description"
                        value={editingData.description}
                        onChange={(e) => handleChange(e, "edit")}
                        required
                      />
                    </div>
                    <div>
                      <label className="block">Prompt</label>
                      <textarea
                        name="prompt"
                        className="w-full p-2 border rounded"
                        value={editingData.prompt}
                        onChange={(e) => handleChange(e, "edit")}
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label className="block">Icon</label>
                      <Input
                        name="icon"
                        value={editingData.icon}
                        onChange={(e) => handleChange(e, "edit")}
                        placeholder="Icon name"
                      />
                    </div>
                    <div>
                      <label className="block">Gradient</label>
                      <Input
                        name="gradient"
                        value={editingData.gradient}
                        onChange={(e) => handleChange(e, "edit")}
                        placeholder="CSS gradient classes"
                      />
                    </div>
                    <div>
                      <label className="block">Text Color</label>
                      <Input
                        name="textColor"
                        value={editingData.textColor}
                        onChange={(e) => handleChange(e, "edit")}
                        placeholder="CSS text color classes"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor={`edit-redirect-${cat._id}`}>
                        Redirectable to other category?
                      </label>
                      <Input
                        id={`edit-redirect-${cat._id}`}
                        name="redirectableToOtherCategory"
                        type="checkbox"
                        checked={editingData.redirectableToOtherCategory}
                        onChange={(e) => handleChange(e, "edit")}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Save</Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  // Display mode: Show category details along with Edit and Delete buttons.
                  <>
                    <div>
                      <strong>Name:</strong> {cat.name}
                    </div>
                    <div>
                      <strong>Description:</strong> {cat.description}
                    </div>
                    <div>
                      <strong>Prompt:</strong> {cat.prompt}
                    </div>
                    {cat.icon && (
                      <div>
                        <strong>Icon:</strong> {cat.icon}
                      </div>
                    )}
                    {cat.gradient && (
                      <div>
                        <strong>Gradient:</strong> {cat.gradient}
                      </div>
                    )}
                    {cat.textColor && (
                      <div>
                        <strong>Text Color:</strong> {cat.textColor}
                      </div>
                    )}
                    <div>
                      <strong>Redirectable:</strong>{" "}
                      {cat.redirectableToOtherCategory ? "Yes" : "No"}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => startEditing(cat)}>Edit</Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(cat._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
