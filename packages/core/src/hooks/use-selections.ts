import { useMemoizedFn } from "@workspace/core/hooks/use-memoized-fn";
import { useState } from "react";

/**
 * This hook is used for Checkbox group, supports multiple selection, single selection, select-all, select-none and semi-selected etc.
 *
 * @example
 *
 * ```tsx
 * const list = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 9], []);
 *
 * const { selected, allSelected, isSelected, toggle, toggleAll, partiallySelected } = useSelections(
 *   list,
 *   [1],
 * );
 *
 * return (
 *   <Container>
 *     <h3>Selected : {selected.join(', ')}</h3>
 *     <Checkbox checked={allSelected} onClick={toggleAll} indeterminate={partiallySelected}>
 *       {allSelected ? 'Uncheck All' : 'Check all'}
 *     </Checkbox>
 *     <Row>
 *       {list.map((val) => (
 *         <Col span={12} key={val}>
 *           <Checkbox checked={isSelected(val)} onClick={() => toggle(val)}>
 *             {val}
 *           </Checkbox>
 *         </Col>
 *       ))}
 *     </Row>
 *   </Container>
 * );
 * ```
 */
/** Returns the selection with `item` added. */
const withItem = <T>(selectedSet: Set<T>, item: T) => [
  ...new Set([...selectedSet, item]),
];

/** Returns the selection with `item` removed. */
const withoutItem = <T>(selectedSet: Set<T>, item: T) => {
  const newSet = new Set(selectedSet);
  newSet.delete(item);
  return [...newSet];
};

/** Returns the selection with every item of `items` added. */
const withItems = <T>(selectedSet: Set<T>, items: T[]) => {
  const newSet = new Set(selectedSet);
  for (const o of items) {
    newSet.add(o);
  }
  return [...newSet];
};

/** Returns the selection with every item of `items` removed. */
const withoutItems = <T>(selectedSet: Set<T>, items: T[]) => {
  const newSet = new Set(selectedSet);
  for (const o of items) {
    newSet.delete(o);
  }
  return [...newSet];
};

export const useSelections = <T>(items: T[], defaultSelected: T[] = []) => {
  // Selected Items, Set selected items
  const [selected, setSelected] = useState<T[]>(defaultSelected);
  const selectedSet = new Set(selected);

  /** Check if an item is selected */
  const isSelected = (item: T) => selectedSet.has(item);
  /** Select an item */
  const select = (item: T) => setSelected(withItem(selectedSet, item));
  /** UnSelect an item */
  const unSelect = (item: T) => setSelected(withoutItem(selectedSet, item));
  /** Toggle the select status of an item */
  const toggle = (item: T) => {
    if (isSelected(item)) {
      unSelect(item);
    } else {
      select(item);
    }
  };
  /** Select all items in the list */
  const selectAll = () => setSelected(withItems(selectedSet, items));
  /** UnSelect all items in the list */
  const unSelectAll = () => setSelected(withoutItems(selectedSet, items));
  /**
   * Check if no item is selected
   */
  const noneSelected = items.every((o) => !selectedSet.has(o));
  const allSelected = items.every((o) => selectedSet.has(o)) && !noneSelected;
  const partiallySelected = !noneSelected && !allSelected;

  /**
   * Toggle select all items
   */
  const toggleAll = () => (allSelected ? unSelectAll() : selectAll());

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
