import type { useEffect, useLayoutEffect } from "react";
import { useRef } from "react";

type EffectHookType = typeof useEffect | typeof useLayoutEffect;

export const createUpdateEffect: (hook: EffectHookType) => EffectHookType =
  (hook) => (effect, deps) => {
    const isMountedRef = useRef(false);

    hook(
      () => () => {
        isMountedRef.current = false;
      },
      []
    );

    hook(() => {
      if (isMountedRef.current) {
        return effect();
      }

      isMountedRef.current = true;
    }, deps);
  };
