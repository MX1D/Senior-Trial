// Package imports
import config from "./config.js"
import { error } from "./utils/logging.js";
import { Client, GatewayIntentBits, Partials } from "discord.js";

// Initilazing the client
export const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], partials: [Partials.Message, Partials.GuildMember, Partials.Channel, Partials.Reaction, Partials.User] });
client.cooldowns = [];

// Command & event handlers
import eventHandler from "./handlers/eventHandler.js";
import idkHowToCallThisHandler from "./handlers/idkHowToCallThisHandler.js";
import { connect } from "./database/database.js";

await idkHowToCallThisHandler.init();
eventHandler.function();
await connect();

// Catching all the errors
process.on("uncaughtException", config.debugMode ? console.error : error);
process.on("unhandledRejection", config.debugMode ? console.error : error);

client.login(config.token);