import type {
  BookingAddOn,
  BookingCategory,
  BookingCategoryCombination,
  BookingCategoryMeta,
  BookingPackage,
  BookingSelection,
} from '@/lib/types';
export {
  formatBookingDateTimeLocal,
  getBookingResumeStep,
  isValidBookingDateTimeLocal,
  isValidBookingEmail,
  isValidBookingPhone,
  parseBookingDateTimeLocal,
  validateBookingContactFields,
  validateBookingRequest,
} from '@/lib/bookingValidation';

type BookingCategoryWithCompatibility = {
  id: string;
  compatibleCategoryIds: string[];
};

export function buildBookingCompatibilityMap(
  categoryIds: string[],
  combinations: BookingCategoryCombination[],
) {
  const map = Object.fromEntries(
    categoryIds.map((id) => [id, new Set<string>()]),
  ) as Record<string, Set<string>>;

  for (const combination of combinations) {
    const ids = Array.from(
      new Set(combination.categoryIds.filter((id) => map[id])),
    );

    for (const id of ids) {
      for (const otherId of ids) {
        if (id !== otherId) {
          map[id].add(otherId);
        }
      }
    }
  }

  return Object.fromEntries(
    Object.entries(map).map(([id, compatibleIds]) => [
      id,
      Array.from(compatibleIds),
    ]),
  ) as Record<string, string[]>;
}

export function attachCompatibleCategoryIds<T extends { id: string }>(
  categories: T[],
  combinations: BookingCategoryCombination[],
): Array<T & { compatibleCategoryIds: string[] }> {
  const compatibilityMap = buildBookingCompatibilityMap(
    categories.map((category) => category.id),
    combinations,
  );

  return categories.map((category) => ({
    ...category,
    compatibleCategoryIds: compatibilityMap[category.id] ?? [],
  }));
}

export function createBookingCategoryLookup<
  T extends BookingCategoryWithCompatibility,
>(categories: T[]) {
  return Object.fromEntries(
    categories.map((category) => [category.id, category]),
  ) as Record<string, T>;
}

export function areBookingCategoriesCompatible(
  categoryIds: string[],
  compatibilityMap: Record<string, string[]>,
) {
  for (let i = 0; i < categoryIds.length; i += 1) {
    for (let j = i + 1; j < categoryIds.length; j += 1) {
      const currentId = categoryIds[i];
      const nextId = categoryIds[j];
      if (!compatibilityMap[currentId]?.includes(nextId)) {
        return false;
      }
    }
  }

  return true;
}

export function getSelectableBookingCategoryIds(
  selectedIds: string[],
  allCategoryIds: string[],
  compatibilityMap: Record<string, string[]>,
) {
  if (selectedIds.length === 0) {
    return new Set(allCategoryIds);
  }

  return new Set(
    allCategoryIds.filter((candidateId) =>
      selectedIds.every(
        (selectedId) =>
          selectedId === candidateId ||
          compatibilityMap[selectedId]?.includes(candidateId),
      ),
    ),
  );
}

export type ResolvedBookingSelection = {
  selection: BookingSelection;
  category: BookingCategory | null;
  selectedPackage: BookingPackage | null;
  resolvedAddOns: BookingAddOn[];
  subtotal: number;
};

export function resolveBookingSelections(
  selections: BookingSelection[],
  categories: Record<string, BookingCategory>,
): ResolvedBookingSelection[] {
  return selections.map((selection) => {
    const category = categories[selection.categoryId] ?? null;
    const selectedPackage =
      category?.packages.find((pkg) => pkg.id === selection.packageId) ?? null;
    const resolvedAddOns =
      category?.addOns?.filter((addOn) =>
        selection.addOnIds.includes(addOn.id),
      ) ?? [];

    return {
      selection,
      category,
      selectedPackage,
      resolvedAddOns,
      subtotal:
        (selectedPackage?.price ?? 0) +
        resolvedAddOns.reduce((sum, addOn) => sum + addOn.price, 0),
    };
  });
}

export function getBookingTotal(
  selections: BookingSelection[],
  categories: Record<string, BookingCategory>,
) {
  return resolveBookingSelections(selections, categories).reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );
}

export function toBookingCategoryMap(
  categories: BookingCategory[],
): Record<string, BookingCategory> {
  return createBookingCategoryLookup(categories);
}

export function toBookingMetaMap(
  categories: BookingCategoryMeta[],
): Record<string, BookingCategoryMeta> {
  return createBookingCategoryLookup(categories);
}
