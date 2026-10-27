import { commands } from "./cache/commands.js"
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import type { Client } from "discord.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function load(client: Client) {
    fs.readdir(__dirname + "/commands", (async (_, files) => {
        files.forEach(async (file) => {
            if (!file.endsWith(".js")) return;

            const command = await import(pathToFileURL(__dirname + "/commands/" + file).href)
            commands.set(command.data.name, command.execute)
            console.log(`${command.data.name} をロードしました。`)
        })
    }))

    fs.readdir(__dirname + "/events", (async (_, files) => {
        files.forEach(async (file) => {
            fs.readdir(__dirname + "/events/" + file, (async (_, eventFiles) => {
                eventFiles.forEach(async (eventFile) => {
                    if (!eventFile.endsWith(".js")) return;
                    const eventImport = await import(pathToFileURL(__dirname + "/events/" + `${file}/` + eventFile).href)
                    client.on(`${file}`, eventImport.execute)
                    console.log(`${file}イベントの ${eventFile}をロードしました。`)
                })
            }));
        })
    }))
}
