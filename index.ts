import getFromDictionaryApi from "./src/dict/get-from-dictionaryapi";
import { initDb } from "./src/db/init-db";
import { createBot } from "./src/bot/create-bot";
import { getLogger } from "./src/utils/get-logger";
import config from "./config";

(async function() {
  const { wordRepository, defRepository, userRepository, shutdown: shutdownDatabase } = await initDb(config);
  const logger = getLogger(config);

  const bot = await createBot("6360199578:AAE06Qmpb1H9sh9UZ8HCWl19vvINpTIPBZ4", {
    defProvider: getFromDictionaryApi,
    wordRepo: wordRepository,
    defRepo: defRepository,
    userRepo: userRepository,
    logger,
  });

  const stop = async () => {
    await bot.stop();
    await shutdownDatabase();
  };

  // process.on('warning', logError('warning'));
  // process.on('uncaughtException', logError('Uncaught exception'));
  // process.on('unhandledRejection', logError('Unhandled rejection'));
  // process.on('SIGINT', stop);
  // process.on('SIGTERM', stop);

  process.on("uncaughtException", function(exception) {
    console.log(exception);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.log(reason);
  });
})();
