import { ILogger } from "./ILogger";
import winston from "winston";
import { isProduction } from "./is-production";

export function getLogger({ logPath }: { logPath: string }): ILogger {
  if (isProduction())
    return createWinston(logPath);
  return console;
}

function createWinston(logPath: string) {
  const logger = winston.createLogger({
    transports: [
      new winston.transports.File({ filename: logPath })
    ]
  });

  return logger as ILogger;
}