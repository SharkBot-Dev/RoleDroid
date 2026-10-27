import { ContextMenuCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { error } from "../../color.js";
import { commands } from "../../cache/commands.js";

export async function execute(interaction: ContextMenuCommandInteraction) {
    if (!interaction.isContextMenuCommand()) return;

    if (!interaction.guildId) {
        await interaction.reply({
            embeds: [new EmbedBuilder({
                title: "DMではコマンドを実行できません。",
                color: error,
                description: "解決方法:\nサーバーでコマンドを実行する"
            })],
            flags: MessageFlags.Ephemeral
        })
        return
    };

    const executeCommand = commands.get(interaction.commandName);
    if (!executeCommand) return;

    try {
        await executeCommand(interaction);
    } catch (e) {
        console.error(e);
        return
    }
}

