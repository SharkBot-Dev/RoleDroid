import { Client, Events, GatewayIntentBits, Options } from "discord.js";
import { config } from "dotenv";
import { load } from "./load.js";

config();

const client = new Client(
    { 
        intents: [GatewayIntentBits.Guilds],
        makeCache: Options.cacheWithLimits({
            MessageManager: 0, 
            ThreadManager: 0,
            StageInstanceManager: 0,
        })
    },
);

load(client);

client.on(Events.ShardError, (error) => {
    console.error('A websocket connection encountered an error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

if (process.env.TOKEN) {
    client.login(process.env.TOKEN);
} else {
    console.warn("環境変数 TOKEN がありません。")
}