import getFromDictionaryApi from "./src/dict/get-from-dictionaryapi";
import { initDb } from "./src/db/init-db";
import { createBot } from "./src/bot/create-bot";

(async function () {
  const { wordRepository, defRepository } = await initDb();

  await createBot("6360199578:AAE06Qmpb1H9sh9UZ8HCWl19vvINpTIPBZ4", {
    defProvider: getFromDictionaryApi,
    wordRepo: wordRepository,
    defRepo: defRepository,
  });

  // const wid = await wordRepository.add("slovo", "123")
  // // console.log(await wordRepository.getAll( "123"))
  // const userId = "256";
  // await defRepository.add(wid, userId, "This is a definition")
  // let result = await defRepository.getForWord(wid, userId)
  // console.log(result)
})();
