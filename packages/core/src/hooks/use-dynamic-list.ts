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
export const useDynamicList = <T>(initialList: T[] = []) => {
  const counterRef = useRef(-1);
  const keyListRef = useRef<number[]>([]);
  const setKey = (index: number) => {
    counterRef.current += 1;
    keyListRef.current.splice(index, 0, counterRef.current);
  };
  // Current list
  // oxlint-disable-next-line react/react-compiler -- key refs initialized once in lazy state
  const [list, setList] = useState(() => {
    // Initialize keyList directly without using setKey callback
    // to avoid fragile behavior during state initialization
    keyListRef.current = initialList.map(() => {
      counterRef.current += 1;
      return counterRef.current;
    });
    return initialList;
  });
  // Reset list current data
  const resetList = (newList: T[]) => {
    keyListRef.current = [];
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
  // Get the uuid of specific item
  const getKey = (index: number) => keyListRef.current[index];
  // Retrieve index from uuid
  const getIndex = (key: number) => keyListRef.current.indexOf(key);
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
      keyListRef.current.splice(index, 1);
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
      const keyTemp = keyListRef.current.filter(
        (_, index: number) => index !== oldIndex
      );
      keyTemp.splice(newIndex, 0, keyListRef.current[oldIndex] as number);
      keyListRef.current = keyTemp;
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
    keyListRef.current = keyListRef.current.slice(0, -1);
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
    keyListRef.current = keyListRef.current.slice(1);
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
