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
import { deliverTelemetryOnHide } from "@/utils/telemetry-delivery";
import { reportWebVitals } from "@/utils/web-vitals";

import "@/styles/globals.css";

deliverTelemetryOnHide();

reportWebVitals();

const root = document.querySelector("#root");

if (!(root instanceof HTMLElement)) {
  throw new TypeError(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
  );
}

const reportRootError = (name: string, error: ReportedError) => {
  // oxlint-disable-next-line landmines/no-unowned-task -- appRuntime owns the fiber and interrupts it on dispose; recordException cannot fail
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
