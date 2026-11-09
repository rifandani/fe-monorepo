import { createRoot } from "react-dom/client";

import { Entry } from "@/app/entry";
import { appRuntime } from "@/lib/layers/runtime";
import {
  TRACER_REACT_ENTRY_ON_CAUGHT_ERROR,
  TRACER_REACT_ENTRY_ON_RECOVERABLE_ERROR,
  TRACER_REACT_ENTRY_ON_UNCAUGHT_ERROR,
} from "@/shared/constants/global";
import { recordException, toReportedError } from "@/utils/telemetry";
import type { ReportedError } from "@/utils/telemetry";
import { reportWebVitals } from "@/utils/web-vitals";

import "@/styles/globals.css";

reportWebVitals();

const root = document.querySelector("#root");

if (!(root instanceof HTMLElement)) {
  throw new TypeError(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
  );
}

/** Record a React root error as a failed span, without blocking React. */
const reportRootError = (name: string, error: ReportedError) => {
  appRuntime.runFork(recordException(name, error));
};

createRoot(root, {
  onCaughtError: (error, { componentStack }) => {
    reportRootError(
      TRACER_REACT_ENTRY_ON_CAUGHT_ERROR,
      toReportedError(error, { componentStack })
    );
  },
  onRecoverableError: (error, { componentStack }) => {
    reportRootError(
      TRACER_REACT_ENTRY_ON_RECOVERABLE_ERROR,
      toReportedError(error, { componentStack })
    );
  },
  onUncaughtError: (error, { componentStack }) => {
    reportRootError(
      TRACER_REACT_ENTRY_ON_UNCAUGHT_ERROR,
      toReportedError(error, { componentStack })
    );
  },
}).render(<Entry />);
