"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Options = {
  orderColumn?: string;
  ascending?: boolean;
};

export function useSupabaseTable<T extends { id: string }>(
  table: string,
  mockData: T[],
  options: Options = {}
) {
  const [data, setData] = useState<T[]>(isSupabaseConfigured ? [] : mockData);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setData(mockData);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    let query = supabase.from(table).select("*");
    if (options.orderColumn) {
      query = query.order(options.orderColumn, { ascending: options.ascending ?? false });
    }
    const { data: rows, error } = await query;
    if (error) {
      setError(error.message);
    } else {
      setData((rows as T[]) ?? []);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  async function addItem(item: Partial<T>) {
    if (!isSupabaseConfigured) {
      const optimistic = { ...item, id: crypto.randomUUID() } as T;
      setData((prev) => [optimistic, ...prev]);
      return { data: optimistic, error: null };
    }
    const supabase = createClient();
    const { data: row, error } = await supabase
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(item as any)
      .select()
      .single();
    if (!error && row) {
      setData((prev) => [row as T, ...prev]);
    }
    return { data: row as T | null, error };
  }

  async function updateItem(id: string, patch: Partial<T>) {
    setData((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    if (!isSupabaseConfigured) return { error: null };
    const supabase = createClient();
    const { error } = await supabase
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(patch as any)
      .eq("id", id);
    return { error };
  }

  async function deleteItem(id: string) {
    setData((prev) => prev.filter((row) => row.id !== id));
    if (!isSupabaseConfigured) return { error: null };
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    return { error };
  }

  return { data, setData, loading, error, addItem, updateItem, deleteItem, reload: load };
}
