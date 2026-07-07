/* oxlint-disable eslint/func-style */
import { useState } from "react";

/**
 * A hook that returns a function which can be used to force the component to re-render.
 */
export function useUpdate() {
  const [, setState] = useState({});
  const update = () => setState({});
  return update;
}
