import {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    MessageFlags,
    ContextMenuCommandInteraction,
    ComponentType,
    PermissionFlagsBits,
} from "discord.js";
import { selectedPanel } from "../cache/panel.js";

export const data = new ContextMenuCommandBuilder()
    .setName("ロールパネルを選択")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setType(ApplicationCommandType.Message);

export async function execute(interaction: ContextMenuCommandInteraction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const message = interaction.targetMessage;

    await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
    });

    if (!message.embeds[0]) {
        await interaction.followUp({
            flags: MessageFlags.Ephemeral,
            content: "❌それはロールパネルではありません。"
        })
        return;
    }

    const component = message.components[0];
    if (!component || component.type !== ComponentType.ActionRow) {
        await interaction.followUp({
            flags: MessageFlags.Ephemeral,
            content: "❌それはロールパネルではありません。"
        })
        return;
    }

    selectedPanel.set(interaction.channelId, message.id);

    await interaction.editReply({
        content: `✅️ \`${message.id}\`を選択しました。`
    })
}