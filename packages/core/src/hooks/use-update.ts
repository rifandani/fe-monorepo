import { useState } from "react";

export const useUpdate = () => {
  const [, setState] = useState({});

  const update = () => {
    setState({});
  };

  return update;
};
