
# About
This Telegram bot aids language learning by assisting users in learning new words in any language. Features include the ability to load word definitions from an online dictionary (english only for now), export saved words as Anki decks and a built-in repetition training mode for vocabulary reinforcement. Additionally, the bot offers the ability for users to assign tags to words, making it possible to learn more than one language or focus on specific thematic vocabulary.

Designed following the best software architecture principles, the bot ensures ease of maintenance and extendability. 

### [Try it here](https://t.me/improve_vocabulary_9000_bot)

# Scheme
Simplified scheme of application architecture/layers. 

Highlights:
* Layered architecture
* Complex bot states are made with passive-view _MVP pattern_ in mind
* General purpose telegram bot framework. Easily extendable and can be used for any application

![Architecture](./images/scheme.png)


# Database structure
![Database structure](./images/db.png)

# How to run

```shell
npm run docker:build -- --tag=IMAGE_TAG
npm run docker:run -- --env BOT_TOKEN=YOUR_BOT_TOKEN --env NODE_ENV=production IMAGE_TAG
```
