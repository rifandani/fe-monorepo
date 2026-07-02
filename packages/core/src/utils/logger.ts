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
const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    fractionalSecondDigits: 3,
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
  });
export const logger = {
  debug(message: string, ...attributes: unknown[]) {
    const severity = "DEBUG";
    const severityColor = LEVEL_COLORS[severity as keyof typeof LEVEL_COLORS];
    const timeFormatted = formatTime(new Date());
    console.debug(
      `${severityColor}[${timeFormatted}] ${severityColor}${severity}: ${COLOR.WHITE}${message}`,
      ...attributes
    );
  },
  error(message: string, ...attributes: unknown[]) {
    const severity = "ERROR";
    const severityColor = LEVEL_COLORS[severity as keyof typeof LEVEL_COLORS];
    const timeFormatted = formatTime(new Date());
    console.error(
      `${severityColor}[${timeFormatted}] ${severityColor}${severity}: ${COLOR.WHITE}${message}`,
      ...attributes
    );
  },
  log(message: string, ...attributes: unknown[]) {
    const severity = "INFO";
    const severityColor = LEVEL_COLORS[severity as keyof typeof LEVEL_COLORS];
    const timeFormatted = formatTime(new Date());
    console.log(
      `${severityColor}[${timeFormatted}] ${severityColor}${severity}: ${COLOR.WHITE}${message}`,
      ...attributes
    );
  },
  warn(message: string, ...attributes: unknown[]) {
    const severity = "WARN";
    const severityColor = LEVEL_COLORS[severity as keyof typeof LEVEL_COLORS];
    const timeFormatted = formatTime(new Date());
    console.warn(
      `${severityColor}[${timeFormatted}] ${severityColor}${severity}: ${COLOR.WHITE}${message}`,
      ...attributes
    );
  },
};
