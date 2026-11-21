import { useMemoizedFn } from "@workspace/core/hooks/use-memoized-fn";
import { useState } from "react";

const withItem = <T>(selectedSet: Set<T>, item: T) => [
  ...new Set([...selectedSet, item]),
];

const withoutItem = <T>(selectedSet: Set<T>, item: T) => {
  const newSet = new Set(selectedSet);
  newSet.delete(item);

  return [...newSet];
};

const withItems = <T>(selectedSet: Set<T>, items: T[]) => {
  const newSet = new Set(selectedSet);

  for (const o of items) {
    newSet.add(o);
  }

  return [...newSet];
};

const withoutItems = <T>(selectedSet: Set<T>, items: T[]) => {
  const newSet = new Set(selectedSet);

  for (const o of items) {
    newSet.delete(o);
  }

  return [...newSet];
};

export const useSelections = <T>(items: T[], defaultSelected: T[] = []) => {
  const [selected, setSelected] = useState<T[]>(defaultSelected);
  const selectedSet = new Set(selected);

  const isSelected = (item: T) => selectedSet.has(item);

  const select = (item: T) => {
    setSelected(withItem(selectedSet, item));
  };

  const unSelect = (item: T) => {
    setSelected(withoutItem(selectedSet, item));
  };

  const toggle = (item: T) => {
    if (isSelected(item)) {
      unSelect(item);
    } else {
      select(item);
    }
  };

  const selectAll = () => {
    setSelected(withItems(selectedSet, items));
  };

  const unSelectAll = () => {
    setSelected(withoutItems(selectedSet, items));
  };

  const noneSelected = items.every((o) => !selectedSet.has(o));
  const allSelected = items.every((o) => selectedSet.has(o)) && !noneSelected;
  const partiallySelected = !noneSelected && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      unSelectAll();
    } else {
      selectAll();
    }
  };

  return {
    allSelected,
    isSelected,
    noneSelected,
    partiallySelected,
    select: useMemoizedFn(select),
    selectAll: useMemoizedFn(selectAll),
    selected,
    setSelected,
    toggle: useMemoizedFn(toggle),
    toggleAll: useMemoizedFn(toggleAll),
    unSelect: useMemoizedFn(unSelect),
    unSelectAll: useMemoizedFn(unSelectAll),
  } as const;
};
