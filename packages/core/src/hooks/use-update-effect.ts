import { createUpdateEffect } from "@workspace/core/hooks/create-update-effect";
import { useEffect } from "react";

export const useUpdateEffect = createUpdateEffect(useEffect);
