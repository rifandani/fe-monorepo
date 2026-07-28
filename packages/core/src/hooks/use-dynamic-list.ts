/* oxlint-disable react/react-compiler */
import { useRef, useState } from "react";

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

export const useDynamicList = <T>(initialList: T[] = []) => {
  const {
    getKey,
    getIndex,
    setKey,
    initKeys,
    removeKey,
    moveKey,
    clearKeys,
    popKey,
    shiftKey,
  } = useKeyList();
  // Current list
  const [list, setList] = useState(() => {
    // Initialize keyList directly without using setKey callback
    // to avoid fragile behavior during state initialization
    initKeys(initialList);
    return initialList;
  });
  // Reset list current data
  const resetList = (newList: T[]) => {
    clearKeys();
    setList(() => {
      for (const [index] of newList.entries()) {
        setKey(index);
      }
      return newList;
    });
  };
  // Add item at specific position
  const insert = (index: number, item: T) => {
    setList((l) => {
      const temp = [...l];
      temp.splice(index, 0, item);
      setKey(index);
      return temp;
    });
  };
  // Merge items into specific position
  const merge = (index: number, items: T[]) => {
    setList((l) => {
      const temp = [...l];
      for (const [i] of items.entries()) {
        setKey(index + i);
      }
      temp.splice(index, 0, ...items);
      return temp;
    });
  };
  // Replace item at specific position
  const replace = (index: number, item: T) => {
    setList((l) => {
      const temp = [...l];
      temp[index] = item;
      return temp;
    });
  };
  // Delete specific item
  const remove = (index: number) => {
    setList((l) => {
      const temp = [...l];
      temp.splice(index, 1);
      // remove keys if necessary
      removeKey(index);
      return temp;
    });
  };
  // Move item from old index to new index
  const move = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) {
      return;
    }
    setList((l) => {
      const newList = [...l];
      const temp = newList.filter((_, index: number) => index !== oldIndex);
      temp.splice(newIndex, 0, newList[oldIndex] as T);
      // move keys if necessary
      moveKey(oldIndex, newIndex);
      return temp;
    });
  };
  // Push new item at the end of list
  const push = (item: T) => {
    setList((l) => {
      setKey(l.length);
      return [...l, item];
    });
  };
  // Remove the last item from the list
  const pop = () => {
    // remove keys if necessary
    popKey();
    setList((l) => l.slice(0, -1));
  };
  // Add new item at the front of the list
  const unshift = (item: T) => {
    setList((l) => {
      setKey(0);
      return [item, ...l];
    });
  };
  // Remove the first item from the list
  const shift = () => {
    // remove keys if necessary
    shiftKey();
    setList((l) => l.slice(1));
  };
  return {
    getIndex,
    getKey,
    insert,
    list,
    merge,
    move,
    pop,
    push,
    remove,
    replace,
    resetList,
    shift,
    unshift,
  } as const;
};
