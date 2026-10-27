import { ActivityType, type Client } from "discord.js";

export async function execute(client: Client) {
    console.log("起動しました。")

    setInterval(() => {
        client.user?.setActivity(`稼働中です！`,{
            type: ActivityType.Custom
        });
    }, 10000)
}