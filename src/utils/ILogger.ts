export interface ILogger {
  error(...data: any[]): void;

  warn(...data: any[]): void;

  log(...data: any[]): void;

  info(...data: any[]): void;
}




