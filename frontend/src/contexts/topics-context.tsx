"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "@/lib/fetch";
import { useAuth } from "@/contexts/auth-context";

// Extend the category definition with an optional emotions field if needed.
export interface Topic {
  _id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl?: string;
  gradient: string;
  textColor: string;
  emotions?: string[];
}

// A default topics array used as initial data (or fallback) in case you want to
// avoid empty states in your components. (You can adjust these values as needed.)
const defaultTopics: Topic[] = [];

interface TopicsContextType {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  refetchTopics: () => void;
}

const TopicsContext = createContext<TopicsContextType>({
  topics: [],
  loading: false,
  error: null,
  refetchTopics: () => {},
});

export function TopicsProvider({ children }: { children: React.ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>(defaultTopics);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchTopics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // Adjust the endpoint if needed.
      const data = await apiFetch<Topic[]>("/api/categories/public", { token });
      // If the API returns topics, you can choose to override your defaultTopics:
      setTopics(data);
    } catch (err: any) {
      setError(err.message || "Failed to load topics.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTopics();
    }
  }, [token, fetchTopics]);

  return (
    <TopicsContext.Provider
      value={{ topics, loading, error, refetchTopics: fetchTopics }}
    >
      {children}
    </TopicsContext.Provider>
  );
}

export function useTopics() {
  return useContext(TopicsContext);
}
