import { ILogger } from "./ILogger";
import winston from "winston";
import { isProduction } from "./is-production";

export function getLogger({ logPath }: { logPath: string }): { logger: ILogger; shutdown: () => Promise<void> } {
  if (isProduction()) return createWinston(logPath);

  return { logger: console, shutdown: async () => void {} };
}

function createWinston(logPath: string) {

  const logger = winston.createLogger({
    level: "info",
    transports: [
      new winston.transports.File({ filename: logPath }),
      new winston.transports.Console()
    ]
  });

  const wrapper : ILogger = {
    error: (...data: any[]) => logger.error(data.toString()),
    warn: (...data: any[]) => logger.warn(data.toString()),
    log: (...data: any[]) => logger.debug(data.toString()),
    info: (...data: any[]) => logger.info(data.toString()),
  }

  return { logger: wrapper, shutdown: async () => { logger.end() } };
}
