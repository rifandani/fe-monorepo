/* oxlint-disable react/react-compiler */
import { useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

/**
 * A hook that helps you manage dynamic list and generate unique key for each item.
 *
 * @example
 *
 * ```tsx
 * const { list, remove, getKey, insert, replace } = useDynamicList(['David', 'Jack']);
 *
 * return (
 *   <div>
 *     {list.map((elem, index) => (
 *       <div key={getKey(index)} style={{ marginBottom: 16 }}>
 *         <Input
 *           placeholder="Please enter name"
 *           onChange={(e) => replace(index, e.target.value)}
 *           value={item}
 *         />
 *         {list.length > 1 && (
 *           <MinusCircleOutlined
 *             onClick={() => {
 *               remove(index);
 *             }}
 *           />
 *         )}
 *
 *         <PlusCircleOutlined
 *           onClick={() => {
 *             insert(index + 1, '');
 *           }}
 *         />
 *       </div>
 *     ))}
 *
 *     <pre>{JSON.stringify([list], null, 2)}</pre>
 *   </div>
 * );
 * ```
 */
/**
 * Tracks one unique, stable key per list item, mirroring every list mutation.
 */
const useKeyList = () => {
  const counterRef = useRef(-1);
  const keyListRef = useRef<number[]>([]);
  return {
    // Get the uuid of specific item
    getKey: (index: number) => keyListRef.current[index],
    // Retrieve index from uuid
    getIndex: (key: number) => keyListRef.current.indexOf(key),
    // Generate a key for a newly inserted item at `index`
    setKey: (index: number) => {
      counterRef.current += 1;
      keyListRef.current.splice(index, 0, counterRef.current);
    },
    // Generate the initial keys, one per item of `initialList`
    initKeys: <T>(initialList: T[]) => {
      keyListRef.current = initialList.map(() => {
        counterRef.current += 1;
        return counterRef.current;
      });
    },
    // Drop the key at `index`
    removeKey: (index: number) => {
      keyListRef.current.splice(index, 1);
    },
    // Move the key at `oldIndex` to `newIndex`
    moveKey: (oldIndex: number, newIndex: number) => {
      const keyTemp = keyListRef.current.filter(
        (_, index: number) => index !== oldIndex
      );
      // SAFETY: `oldIndex` addresses an existing entry - the caller moves an item
      // already in the list, so the key list has a number at that position.
      keyTemp.splice(newIndex, 0, keyListRef.current[oldIndex] as number);
      keyListRef.current = keyTemp;
    },
    // Reset the keys back to empty
    clearKeys: () => {
      keyListRef.current = [];
    },
    // Drop the last key
    popKey: () => {
      keyListRef.current = keyListRef.current.slice(0, -1);
    },
    // Drop the first key
    shiftKey: () => {
      keyListRef.current = keyListRef.current.slice(1);
    },
  };
};

type KeyList = ReturnType<typeof useKeyList>;

/**
 * Builds the list mutators, each of which mirrors its change into `keys`.
 *
 * Kept outside the hook so the hook body stays a thin wiring layer. The
 * closures are recreated per render either way, so identity is unchanged.
 */
const createListMutators = <T>(
  setList: Dispatch<SetStateAction<T[]>>,
  keys: KeyList
) => ({
  // Add item at specific position
  insert: (index: number, item: T) => {
    setList((l) => {
      const temp = [...l];
      temp.splice(index, 0, item);
      keys.setKey(index);
      return temp;
    });
  },
  // Merge items into specific position
  merge: (index: number, items: T[]) => {
    setList((l) => {
      const temp = [...l];
      for (const [i] of items.entries()) {
        keys.setKey(index + i);
      }
      temp.splice(index, 0, ...items);
      return temp;
    });
  },
  // Move item from old index to new index
  move: (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) {
      return;
    }
    setList((l) => {
      const newList = [...l];
      const temp = newList.filter((_, index: number) => index !== oldIndex);
      // SAFETY: `oldIndex` addresses an existing item; `noUncheckedIndexedAccess`
      // widens the read to `T | undefined` even though the slot is occupied.
      temp.splice(newIndex, 0, newList[oldIndex] as T);
      // move keys if necessary
      keys.moveKey(oldIndex, newIndex);
      return temp;
    });
  },
  // Remove the last item from the list
  pop: () => {
    // remove keys if necessary
    keys.popKey();
    setList((l) => l.slice(0, -1));
  },
  // Push new item at the end of list
  push: (item: T) => {
    setList((l) => {
      keys.setKey(l.length);
      return [...l, item];
    });
  },
  // Delete specific item
  remove: (index: number) => {
    setList((l) => {
      const temp = [...l];
      temp.splice(index, 1);
      // remove keys if necessary
      keys.removeKey(index);
      return temp;
    });
  },
  // Replace item at specific position
  replace: (index: number, item: T) => {
    setList((l) => {
      const temp = [...l];
      temp[index] = item;
      return temp;
    });
  },
  // Reset list current data
  resetList: (newList: T[]) => {
    keys.clearKeys();
    setList(() => {
      for (const [index] of newList.entries()) {
        keys.setKey(index);
      }
      return newList;
    });
  },
  // Remove the first item from the list
  shift: () => {
    // remove keys if necessary
    keys.shiftKey();
    setList((l) => l.slice(1));
  },
  // Add new item at the front of the list
  unshift: (item: T) => {
    setList((l) => {
      keys.setKey(0);
      return [item, ...l];
    });
  },
});

export const useDynamicList = <T>(initialList: T[] = []) => {
  const keys = useKeyList();
  // Current list
  const [list, setList] = useState(() => {
    // Initialize keyList directly without using setKey callback
    // to avoid fragile behavior during state initialization
    keys.initKeys(initialList);
    return initialList;
  });
  return {
    ...createListMutators<T>(setList, keys),
    getIndex: keys.getIndex,
    getKey: keys.getKey,
    list,
  } as const;
};
