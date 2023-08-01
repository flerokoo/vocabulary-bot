import getFromDictionaryApi from "./src/dict/get-from-dictionaryapi";
import { initDb } from "./src/db/init-db";
import { createBot } from "./src/bot/create-bot";
import { getLogger } from "./src/utils/get-logger";
import config from "./config";
import { isProduction } from "./src/utils/is-production";

async function start() {
  const {
    wordRepository,
    defRepository,
    userRepository,
    tagRepository,
    shutdown: shutdownDatabase
  } = await initDb(config);

  const { logger, shutdown: shutdownLogger } = getLogger(config);

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    logger.error("No bot token provided");
    process.exit();
    return;
  }

  const bot = await createBot(botToken, {
    defProvider: getFromDictionaryApi,
    wordRepo: wordRepository,
    defRepo: defRepository,
    userRepo: userRepository,
    tagRepo: tagRepository,
    logger
  });

  const stop = async () => {
    logger.log(`Stopping...`)
    await bot.stop();
    await shutdownDatabase();
    await shutdownLogger();
    setTimeout(() => {
    }, config.shutdownTime);
  };

  const logError = (type: string) => (err: any) => logger.error(type, err);
  process.on("warning", logError("warning"));
  process.on("uncaughtException", logError("Uncaught exception"));
  process.on("unhandledRejection", logError("Unhandled rejection"));
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  process.on("uncaughtException", console.error);
  process.on("unhandledRejection", console.error);


  const mode = isProduction() ? "PRODUCTION" : "DEV";
  logger.log(`Ready in ${mode} mode`);
}

start();