/* oxlint-disable react/react-compiler */
import { useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

const useKeyList = () => {
  const counterRef = useRef(-1);
  const keyListRef = useRef<number[]>([]);

  return {
    getKey: (index: number) => keyListRef.current[index],
    getIndex: (key: number) => keyListRef.current.indexOf(key),
    setKey: (index: number) => {
      counterRef.current += 1;
      keyListRef.current.splice(index, 0, counterRef.current);
    },
    initKeys: (count: number) => {
      keyListRef.current = Array.from({ length: count }, () => {
        counterRef.current += 1;

        return counterRef.current;
      });
    },
    removeKey: (index: number) => {
      keyListRef.current.splice(index, 1);
    },
    moveKey: (oldIndex: number, newIndex: number) => {
      const keyTemp = [...keyListRef.current];
      const movedKeys = keyTemp.splice(oldIndex, 1);

      keyTemp.splice(newIndex, 0, ...movedKeys);
      keyListRef.current = keyTemp;
    },
    clearKeys: () => {
      keyListRef.current = [];
    },
    popKey: () => {
      keyListRef.current = keyListRef.current.slice(0, -1);
    },
    shiftKey: () => {
      keyListRef.current = keyListRef.current.slice(1);
    },
  };
};

type KeyList = ReturnType<typeof useKeyList>;

const createListMutators = <T>(
  setList: Dispatch<SetStateAction<T[]>>,
  keys: KeyList
) => ({
  insert: (index: number, item: T) => {
    setList((l) => {
      const temp = [...l];
      temp.splice(index, 0, item);
      keys.setKey(index);

      return temp;
    });
  },
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
  move: (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) {
      return;
    }

    setList((l) => {
      const temp = [...l];
      const movedItems = temp.splice(oldIndex, 1);

      temp.splice(newIndex, 0, ...movedItems);
      keys.moveKey(oldIndex, newIndex);

      return temp;
    });
  },
  pop: () => {
    keys.popKey();
    setList((l) => l.slice(0, -1));
  },
  push: (item: T) => {
    setList((l) => {
      keys.setKey(l.length);

      return [...l, item];
    });
  },
  remove: (index: number) => {
    setList((l) => {
      const temp = [...l];
      temp.splice(index, 1);
      keys.removeKey(index);

      return temp;
    });
  },
  replace: (index: number, item: T) => {
    setList((l) => {
      const temp = [...l];
      temp[index] = item;

      return temp;
    });
  },
  resetList: (newList: T[]) => {
    keys.clearKeys();
    setList(() => {
      for (const [index] of newList.entries()) {
        keys.setKey(index);
      }

      return newList;
    });
  },
  shift: () => {
    keys.shiftKey();
    setList((l) => l.slice(1));
  },
  unshift: (item: T) => {
    setList((l) => {
      keys.setKey(0);

      return [item, ...l];
    });
  },
});

export const useDynamicList = <T>(initialList: T[] = []) => {
  const keys = useKeyList();

  const [list, setList] = useState(() => {
    keys.initKeys(initialList.length);

    return initialList;
  });

  return {
    ...createListMutators<T>(setList, keys),
    getIndex: keys.getIndex,
    getKey: keys.getKey,
    list,
  } as const;
};
