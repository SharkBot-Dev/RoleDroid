import { commands } from "./cache/commands.js";
import { readdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import type { Client } from "discord.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function load(client: Client) {
    const commandDir = path.join(__dirname, "commands");
    const eventDir = path.join(__dirname, "events");

    const files = await readdir(commandDir);

    await Promise.all(
        files
            .filter((file) => file.endsWith(".js") || file.endsWith(".ts"))
            .map(async (file) => {
                const filePath = path.join(commandDir, file);
                const command = await import(pathToFileURL(filePath).href);

                commands.set(command.data.name, command.execute);
                console.log(`${command.data.name} をロードしました。`);
            })
    );

    const eventDirs = await readdir(eventDir, {
        withFileTypes: true,
    });

    await Promise.all(
        eventDirs
            .filter((entry) => entry.isDirectory())
            .map(async (entry) => {
                const eventName = entry.name;
                const currentEventDir = path.join(eventDir, eventName);
                const eventFiles = await readdir(currentEventDir);

                await Promise.all(
                    eventFiles
                        .filter((file) => file.endsWith(".js") || file.endsWith(".ts"))
                        .map(async (file) => {
                            const filePath = path.join(currentEventDir, file);
                            const eventImport = await import(
                                pathToFileURL(filePath).href
                            );

                            client.on(eventName, eventImport.execute);
                            console.log(
                                `${eventName} イベントの ${file} をロードしました。`
                            );
                        })
                );
            })
    );
}