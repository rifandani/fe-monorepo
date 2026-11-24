import { Effect } from "effect";

type ErrorAttributeValue = boolean | null | number | string | undefined;

export interface ReportedError {
  message: string;
  stack?: string;
  [key: string]: ErrorAttributeValue;
}

const describeThrown = (cause: unknown): string => {
  try {
    return String(cause);
  } catch {
    return Object.prototype.toString.call(cause);
  }
};

export const toReportedError = (
  cause: unknown,
  extra: Record<string, ErrorAttributeValue> = {}
): ReportedError => ({
  ...extra,
  message: cause instanceof Error ? cause.message : describeThrown(cause),
  name: cause instanceof Error ? cause.name : undefined,
  stack: cause instanceof Error ? cause.stack : undefined,
});

const errorAttributes = (error: ReportedError) =>
  Object.fromEntries(
    Object.entries(error).map(([key, value]) => [`error.${key}`, String(value)])
  );

export const recordException = (name: string, error: ReportedError) => {
  const defect = Object.assign(new Error(error.message), {
    stack: error.stack,
  });

  return Effect.die(defect).pipe(
    Effect.withSpan(name, { attributes: errorAttributes(error) }),
    Effect.exit,
    Effect.asVoid
  );
};
