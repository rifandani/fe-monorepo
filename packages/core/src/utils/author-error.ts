export const authorErrorMessage = (
  problem: string,
  reason: string,
  fix: string
): string => `${problem}. ${reason}. Fix: ${fix}.`;
