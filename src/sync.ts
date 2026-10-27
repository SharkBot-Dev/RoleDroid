import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import { REST, Routes } from "discord.js";
import { config } from "dotenv";

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    const loadCommands = [];

    const commandsPath = path.join(__dirname, "commands");
    const commandFiles = fs.readdirSync(commandsPath);

    for (const file of commandFiles) {
        if (!file.endsWith(".js")) continue;

        try {
            const commandPath = path.join(commandsPath, file);
            const command = await import(pathToFileURL(commandPath).href);

            if (!command.data) {
                console.warn(`⚠️ ${file} に data がありません。`);
                continue;
            }

            loadCommands.push(command.data.toJSON());

            console.log(`✅ ${command.data.name} をロードしました。`);
        } catch (error) {
            console.error(`❌ ${file} のロードに失敗しました。`, error);
        }
    }

    const token = process.env.TOKEN;
    const clientId = process.env.CLIENT_ID;

    if (!token) {
        throw new Error("TOKEN が設定されていません。");
    }

    if (!clientId) {
        throw new Error("CLIENT_ID が設定されていません。");
    }

    const rest = new REST({ version: "10" }).setToken(token);

    try {
        console.log(
            `🔄 ${loadCommands.length} 個のスラッシュコマンドを同期します。`
        );

        await rest.put(
            Routes.applicationCommands(clientId),
            {
                body: loadCommands,
            }
        );

        console.log("✅ スラッシュコマンドの同期が完了しました。");
    } catch (error) {
        console.error("❌ スラッシュコマンドの同期に失敗しました。", error);
    }
}

main().catch((error) => {
    console.error("❌ 起動処理中にエラーが発生しました。", error);
});

