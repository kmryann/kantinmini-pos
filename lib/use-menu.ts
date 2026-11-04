"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { Category, MenuItem, MenuPayload } from "@/lib/api-types";

type MenuState = MenuPayload & {
  loading: boolean;
  error: string | null;
};

export function useMenuData() {
  const [state, setState] = useState<MenuState>({
    categories: [],
    menu: [],
    loading: true,
    error: null,
  });

  const reload = useCallback(async () => {
    try {
      const data = await api.menu();
      setState({ ...data, loading: false, error: null });
      return data;
    } catch (error: any) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error?.message || "Menu gagal dimuat.",
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    ...state,
    reload,
    menuById: (id: string) => state.menu.find((item) => item.id === id),
    categoryById: (id: string) => state.categories.find((category) => category.id === id),
  };
}

export function findMenu(menu: MenuItem[], id: string) {
  return menu.find((item) => item.id === id);
}

export function findCategory(categories: Category[], id: string) {
  return categories.find((category) => category.id === id);
}
