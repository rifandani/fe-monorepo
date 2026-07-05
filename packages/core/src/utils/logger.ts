/* oxlint-disable eslint/func-style -- function declarations */
/* eslint-disable no-console */
const COLOR = {
  BLUE: "\u001B[34m",
  GREEN: "\u001B[32m",
  RED: "\u001B[31m",
  WHITE: "\u001B[37m",
  YELLOW: "\u001B[33m",
};
const LEVEL_COLORS = {
  DEBUG: COLOR.GREEN,
  ERROR: COLOR.RED,
  INFO: COLOR.BLUE,
  TRACE: COLOR.WHITE,
  WARN: COLOR.YELLOW,
};
function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    fractionalSecondDigits: 3,
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
  });
}
export const logger = {
  // oxlint-disable-next-line typescript/no-explicit-any -- structured log attributes
  debug(message: string, ...attributes: any[]) {
    const severity = "DEBUG";
    const severityColor = LEVEL_COLORS[severity as keyof typeof LEVEL_COLORS];
    const timeFormatted = formatTime(new Date());
    console.debug(
      `${severityColor}[${timeFormatted}] ${severityColor}${severity}: ${COLOR.WHITE}${message}`,
      ...attributes
    );
  },
  // oxlint-disable-next-line typescript/no-explicit-any -- structured log attributes
  error(message: string, ...attributes: any[]) {
    const severity = "ERROR";
    const severityColor = LEVEL_COLORS[severity as keyof typeof LEVEL_COLORS];
    const timeFormatted = formatTime(new Date());
    console.error(
      `${severityColor}[${timeFormatted}] ${severityColor}${severity}: ${COLOR.WHITE}${message}`,
      ...attributes
    );
  },
  // oxlint-disable-next-line typescript/no-explicit-any -- structured log attributes
  log(message: string, ...attributes: any[]) {
    const severity = "INFO";
    const severityColor = LEVEL_COLORS[severity as keyof typeof LEVEL_COLORS];
    const timeFormatted = formatTime(new Date());
    console.log(
      `${severityColor}[${timeFormatted}] ${severityColor}${severity}: ${COLOR.WHITE}${message}`,
      ...attributes
    );
  },
  // oxlint-disable-next-line typescript/no-explicit-any -- structured log attributes
  warn(message: string, ...attributes: any[]) {
    const severity = "WARN";
    const severityColor = LEVEL_COLORS[severity as keyof typeof LEVEL_COLORS];
    const timeFormatted = formatTime(new Date());
    console.warn(
      `${severityColor}[${timeFormatted}] ${severityColor}${severity}: ${COLOR.WHITE}${message}`,
      ...attributes
    );
  },
};
