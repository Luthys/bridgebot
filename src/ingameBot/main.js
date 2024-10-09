const mineflayer = require("mineflayer");
const SETTINGS = require("../settings.js");
const { bridgeManager } = require("./bridge_manager.js");


let autoReconnectCooldown = SETTINGS.autoReconnectToMinecraftCooldown;

let isConnecting = false;
function reconnectbot() {
  console.log(`[PROCESS] Trying to reconnect in ${autoReconnectCooldown / 1000}s...`);
  isConnecting = true;
  setTimeout(() => {
    createBot();
    isConnecting = false;
  }, autoReconnectCooldown);
}

function createBot() {
  bot = mineflayer.createBot({
    host: "hypixel.net",
    username: SETTINGS.minecraftAccount.email,
    password: SETTINGS.minecraftAccount.password,
    version: "1.8.9",
    auth: "microsoft",
  });
}

let bot = createBot();

bot.on("message", async (message) => {
  const realMessage = `message ${message}`;
  await bridgeManager(realMessage)
});

bot.once("spawn", async () => {
  console.log(`[SUCCESS] Logged to hypixel with success !`);
  autoReconnectCooldown = SETTINGS.autoReconnectToMinecraftCooldown;
});

bot.on("end", () => {
  console.warn(`[WARNING] The bot was disconnected from hypixel`);
  if (isConnecting === false) {
    reconnectbot();
    if (autoReconnectCooldown < 30_000) {
      autoReconnectCooldown = autoReconnectCooldown * 1.5;
    }
  }
});

bot.on("error", (error) => {
  console.warn(`[WARNING] Error in minecraft bot`);
  if (isConnecting === false) {
    reconnectbot();
    if (autoReconnectCooldown < 30_000) {
      autoReconnectCooldown = autoReconnectCooldown * 1.5;
    }
  }
});

module.exports = {
  sendMessageInChat: (message) => {
    bot.chat(`/gc ${message}`);
  }
};