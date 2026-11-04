import type { Localized, MenuItem, OrderItem } from "@/lib/api-types";

export const localized = (value: Localized | undefined, lang: "id" | "en" = "id") =>
  value ? value[lang] || value.id || "" : "";

export function orderItemSummary(item: Pick<OrderItem, "optionLabels"> | { optionLabels?: Localized[] }, lang: "id" | "en" = "id") {
  return (item.optionLabels || []).map((label) => localized(label, lang)).join(" · ");
}

export function optionLabelsFor(menu: MenuItem | undefined, optionIds: string[]): Localized[] {
  if (!menu) return [];
  const labels: Localized[] = [];
  for (const optionId of optionIds) {
    for (const group of menu.options || []) {
      const choice = group.choices.find((entry) => entry.id === optionId);
      if (choice) {
        labels.push(choice.label);
        break;
      }
    }
  }
  return labels;
}
