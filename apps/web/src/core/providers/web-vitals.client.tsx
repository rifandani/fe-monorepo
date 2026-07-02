"use client";
import { log } from "evlog/next/client";
import { useReportWebVitals } from "next/web-vitals";

export const WebVitals = () => {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    log.info({
      area: "web-vitals",
      phase: "report",
      summary: `${metric.name} web vitals metric`,
      ...metric,
    });
  });
  return null;
};
