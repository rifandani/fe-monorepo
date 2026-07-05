/* oxlint-disable eslint/func-style -- function declarations */
import { useMemoizedFn } from "@workspace/core/hooks/use-memoized-fn";
import { useMemo, useState } from "react";

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
export function useSelections<T>(items: T[], defaultSelected: T[] = []) {
  // Selected Items, Set selected items
  const [selected, setSelected] = useState<T[]>(defaultSelected);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  /**
   * Check if an item is selected
   * @param item The item to check
   * @returns True if the item is selected, false otherwise
   */
  const isSelected = (item: T) => selectedSet.has(item);

  /**
   * Select an item
   * @param item The item to select
   * @returns The updated selected items
   */
  const select = (item: T) => setSelected([...new Set([...selectedSet, item])]);

  /**
   * UnSelect an item
   * @param item The item to unselect
   * @returns The updated selected items
   */
  const unSelect = (item: T) => {
    const newSet = new Set(selectedSet);
    newSet.delete(item);
    return setSelected([...newSet]);
  };

  /**
   * Toggle the select status of an item
   * @param item The item to toggle
   */
  const toggle = (item: T) => {
    if (isSelected(item)) {
      unSelect(item);
    } else {
      select(item);
    }
  };

  /**
   * Select all items in the list
   */
  const selectAll = () => {
    const newSet = new Set(selectedSet);
    for (const o of items) {
      newSet.add(o);
    }
    setSelected([...newSet]);
  };

  /**
   * UnSelect all items in the list
   */
  const unSelectAll = () => {
    const newSet = new Set(selectedSet);
    for (const o of items) {
      newSet.delete(o);
    }
    setSelected([...newSet]);
  };
  /**
   * Check if no item is selected
   */
  const noneSelected = useMemo(
    () => items.every((o) => !selectedSet.has(o)),
    [items, selectedSet]
  );
  /**
   * Check if all items are selected
   */
  const allSelected = useMemo(
    () => items.every((o) => selectedSet.has(o)) && !noneSelected,
    [items, selectedSet, noneSelected]
  );
  /**
   * Check if partially items are selected
   */
  const partiallySelected = useMemo(
    () => !noneSelected && !allSelected,
    [noneSelected, allSelected]
  );

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
}
