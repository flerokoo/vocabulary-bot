import getFromDictionaryApi from "./src/dict/get-from-dictionaryapi";
import { initDb } from "./src/db/init-db";
import { createBot } from "./src/bot/create-bot";
import { getLogger } from "./src/utils/get-logger";
import config from "./config";

(async function() {

  const { wordRepository, defRepository, userRepository, shutdown: shutdownDatabase } = await initDb(config);
  const logger = getLogger(config);

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
    logger
  });

  const stop = async () => {
    await bot.stop();
    await shutdownDatabase();
    setTimeout(() => {
    }, config.shutdownTime);
  };

  const logError = (type: string) => (err: any) => logger.error(type, err);
  process.on("warning", logError("warning"));
  process.on("uncaughtException", logError("Uncaught exception"));
  process.on("unhandledRejection", logError("Unhandled rejection"));
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  process.on("uncaughtException", function(exception) {
    console.log(exception);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.log(reason);
  });


  logger.log("Ready")
})();
