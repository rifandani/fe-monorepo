import { isNumber } from "radashi";

export interface History<V> {
  present: V;
  past: V[];
  future: V[];
}

const dumpIndex = (step: number, length: number) => {
  let index = step > 0 ? step - 1 : length + step;

  if (index >= length - 1) {
    index = length - 1;
  }

  if (index < 0) {
    index = 0;
  }

  return index;
};

const hasItems = <V>(items: readonly V[]): items is readonly [V, ...V[]] =>
  items.length > 0;

export const split = <V>(step: number, targetArr: readonly [V, ...V[]]) => {
  const index = dumpIndex(step, targetArr.length);
  const fromCurrent = targetArr.slice(index);
  const [_current, ..._after] = hasItems(fromCurrent) ? fromCurrent : targetArr;

  return {
    _after,
    _before: targetArr.slice(0, index),
    _current,
  };
};

export const pushValue = <V>(
  history: History<V>,
  val: V,
  maxLength: number
): History<V> => {
  const _past = [...history.past, history.present];
  const maxLengthNum = isNumber(maxLength) ? maxLength : Number(maxLength);

  if (maxLengthNum > 0 && _past.length > maxLengthNum) {
    _past.splice(0, 1);
  }

  return {
    future: [],
    past: _past,
    present: val,
  };
};

export const travelForward = <V>(
  history: History<V>,
  step: number
): History<V> => {
  if (!hasItems(history.future)) {
    return history;
  }

  const { _before, _current, _after } = split(step, history.future);

  return {
    future: _after,
    past: [...history.past, history.present, ..._before],
    present: _current,
  };
};

export const travelBackward = <V>(
  history: History<V>,
  step: number
): History<V> => {
  if (!hasItems(history.past)) {
    return history;
  }

  const { _before, _current, _after } = split(step, history.past);

  return {
    future: [..._after, history.present, ...history.future],
    past: _before,
    present: _current,
  };
};
