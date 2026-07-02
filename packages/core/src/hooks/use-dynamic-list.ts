import { useCallback, useRef, useState } from "react";

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
  const setKey = useCallback((index: number) => {
    counterRef.current += 1;
    keyListRef.current.splice(index, 0, counterRef.current);
  }, []);
  const [list, setList] = useState(() => {
    for (const _item of initialList) {
      counterRef.current += 1;
      keyListRef.current.push(counterRef.current);
    }
    return initialList;
  });
  const resetList = useCallback(
    (newList: T[]) => {
      keyListRef.current = [];
      setList(() => {
        for (let index = 0; index < newList.length; index += 1) {
          setKey(index);
        }
        return newList;
      });
    },
    [setKey]
  );
  const insert = useCallback(
    (index: number, item: T) => {
      setList((l) => {
        const temp = [...l];
        temp.splice(index, 0, item);
        setKey(index);
        return temp;
      });
    },
    [setKey]
  );
  const getKey = useCallback((index: number) => keyListRef.current[index], []);
  const getIndex = useCallback(
    (key: number) => keyListRef.current.indexOf(key),
    []
  );
  const merge = useCallback(
    (index: number, items: T[]) => {
      setList((l) => {
        const temp = [...l];
        for (let i = 0; i < items.length; i += 1) {
          setKey(index + i);
        }
        temp.splice(index, 0, ...items);
        return temp;
      });
    },
    [setKey]
  );
  const replace = useCallback((index: number, item: T) => {
    setList((l) => {
      const temp = [...l];
      temp[index] = item;
      return temp;
    });
  }, []);
  const remove = useCallback((index: number) => {
    setList((l) => {
      const temp = [...l];
      temp.splice(index, 1);
      keyListRef.current.splice(index, 1);
      return temp;
    });
  }, []);
  const move = useCallback((oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) {
      return;
    }
    setList((l) => {
      const newList = [...l];
      const temp = newList.filter((_, index: number) => index !== oldIndex);
      temp.splice(newIndex, 0, newList[oldIndex] as T);
      const keyTemp = keyListRef.current.filter(
        (_, index: number) => index !== oldIndex
      );
      keyTemp.splice(newIndex, 0, keyListRef.current[oldIndex] as number);
      keyListRef.current = keyTemp;
      return temp;
    });
  }, []);
  const push = useCallback(
    (item: T) => {
      setList((l) => {
        setKey(l.length);
        return [...l, item];
      });
    },
    [setKey]
  );
  const pop = useCallback(() => {
    keyListRef.current = keyListRef.current.slice(0, -1);
    setList((l) => l.slice(0, -1));
  }, []);
  const unshift = useCallback(
    (item: T) => {
      setList((l) => {
        setKey(0);
        return [item, ...l];
      });
    },
    [setKey]
  );
  const shift = useCallback(() => {
    keyListRef.current = keyListRef.current.slice(1);
    setList((l) => l.slice(1));
  }, []);
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
