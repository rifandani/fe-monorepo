const separator = ". Budget: ";

export const budgetMessage = (what: string, why: string, fix: string) =>
  `${what}. ${why}${separator}{{signature}}. Fix: ${fix}.`;
