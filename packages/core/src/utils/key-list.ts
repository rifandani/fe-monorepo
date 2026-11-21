export interface KeyList {
  readonly keys: readonly number[];
  readonly next: number;
}

const newKeys = (start: number, count: number) =>
  Array.from({ length: count }, (_, offset) => start + offset);

export const createKeyList = (count: number): KeyList => ({
  keys: newKeys(0, count),
  next: count,
});

export const getKey = (keyList: KeyList, index: number) => keyList.keys[index];

export const getIndex = (keyList: KeyList, key: number) =>
  keyList.keys.indexOf(key);

export const insertKeys = (
  keyList: KeyList,
  index: number,
  count: number
): KeyList => {
  const keys = [...keyList.keys];
  keys.splice(index, 0, ...newKeys(keyList.next, count));

  return { keys, next: keyList.next + count };
};

export const removeKey = (keyList: KeyList, index: number): KeyList => {
  const keys = [...keyList.keys];
  keys.splice(index, 1);

  return { keys, next: keyList.next };
};

export const moveKey = (
  keyList: KeyList,
  oldIndex: number,
  newIndex: number
): KeyList => {
  const keys = [...keyList.keys];
  const movedKeys = keys.splice(oldIndex, 1);
  keys.splice(newIndex, 0, ...movedKeys);

  return { keys, next: keyList.next };
};

export const popKey = (keyList: KeyList): KeyList => ({
  keys: keyList.keys.slice(0, -1),
  next: keyList.next,
});

export const shiftKey = (keyList: KeyList): KeyList => ({
  keys: keyList.keys.slice(1),
  next: keyList.next,
});

export const resetKeys = (keyList: KeyList, count: number): KeyList => ({
  keys: newKeys(keyList.next, count),
  next: keyList.next + count,
});
