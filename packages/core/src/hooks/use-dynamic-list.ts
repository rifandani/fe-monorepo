import {
  createKeyList,
  getIndex,
  getKey,
  insertKeys,
  moveKey,
  popKey,
  removeKey,
  resetKeys,
  shiftKey,
} from "@workspace/core/utils/key-list";
import type { KeyList } from "@workspace/core/utils/key-list";
import { useState } from "react";

interface DynamicList<T> {
  keys: KeyList;
  list: T[];
}

type DynamicListUpdate<T> = (
  update: (current: DynamicList<T>) => DynamicList<T>
) => void;

const insertAt = <T>(list: T[], index: number, items: T[]) => {
  const temp = [...list];
  temp.splice(index, 0, ...items);

  return temp;
};

const createListMutators = <T>(setState: DynamicListUpdate<T>) => ({
  insert: (index: number, item: T) => {
    setState(({ keys, list }) => ({
      keys: insertKeys(keys, index, 1),
      list: insertAt(list, index, [item]),
    }));
  },
  merge: (index: number, items: T[]) => {
    setState(({ keys, list }) => ({
      keys: insertKeys(keys, index, items.length),
      list: insertAt(list, index, items),
    }));
  },
  move: (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) {
      return;
    }

    setState(({ keys, list }) => {
      const temp = [...list];
      const movedItems = temp.splice(oldIndex, 1);
      temp.splice(newIndex, 0, ...movedItems);

      return { keys: moveKey(keys, oldIndex, newIndex), list: temp };
    });
  },
  pop: () => {
    setState(({ keys, list }) => ({
      keys: popKey(keys),
      list: list.slice(0, -1),
    }));
  },
  push: (item: T) => {
    setState(({ keys, list }) => ({
      keys: insertKeys(keys, list.length, 1),
      list: [...list, item],
    }));
  },
  remove: (index: number) => {
    setState(({ keys, list }) => {
      const temp = [...list];
      temp.splice(index, 1);

      return { keys: removeKey(keys, index), list: temp };
    });
  },
  replace: (index: number, item: T) => {
    setState(({ keys, list }) => {
      const temp = [...list];
      temp[index] = item;

      return { keys, list: temp };
    });
  },
  resetList: (newList: T[]) => {
    setState(({ keys }) => ({
      keys: resetKeys(keys, newList.length),
      list: newList,
    }));
  },
  shift: () => {
    setState(({ keys, list }) => ({
      keys: shiftKey(keys),
      list: list.slice(1),
    }));
  },
  unshift: (item: T) => {
    setState(({ keys, list }) => ({
      keys: insertKeys(keys, 0, 1),
      list: [item, ...list],
    }));
  },
});

export const useDynamicList = <T>(initialList: T[] = []) => {
  const [state, setState] = useState<DynamicList<T>>(() => ({
    keys: createKeyList(initialList.length),
    list: initialList,
  }));

  return {
    ...createListMutators<T>(setState),
    getIndex: (key: number) => getIndex(state.keys, key),
    getKey: (index: number) => getKey(state.keys, index),
    list: state.list,
  } as const;
};
