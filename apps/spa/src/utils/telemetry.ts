import { Effect } from "effect";

type ErrorAttributeValue = boolean | null | number | string | undefined;

export interface ReportedError {
  message: string;
  stack?: string;
  [key: string]: ErrorAttributeValue;
}

const describeThrown = (thrown: unknown): string => {
  try {
    return String(thrown);
  } catch {
    return Object.prototype.toString.call(thrown);
  }
};

export const toReportedError = (
  thrown: unknown,
  extra: Record<string, ErrorAttributeValue> = {}
): ReportedError => ({
  ...extra,
  message: thrown instanceof Error ? thrown.message : describeThrown(thrown),
  name: thrown instanceof Error ? thrown.name : undefined,
  stack: thrown instanceof Error ? thrown.stack : undefined,
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
