import { Colors, CommandInteraction, ComponentType, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { selectedPanel } from "../cache/panel.js";

export const data = (
    new SlashCommandBuilder()
    .setName("select")
    .setDescription("ロールパネルを選択します。")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption((string) => string.setName("rpid").setDescription("ロールパネルの下にあるidを入力").setRequired(true))
)

export async function execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply({
        flags: MessageFlags.Ephemeral
    })

    if (!interaction.channel?.isSendable()) {
        await interaction.followUp({
            flags: MessageFlags.Ephemeral,
            content: "❌ロールパネルを選択できるチャンネルではありません。"
        })
        return
    }

    try {
        const rpid = interaction.options.getString("rpid", true)

        const message = await interaction.channel.messages.fetch({
            message: rpid
        })

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

        selectedPanel.set(interaction.channelId, rpid)

        await interaction.followUp({
            flags: MessageFlags.Ephemeral,
            content: `✅️ \`${message.id}\`を選択しました。`
        })
    } catch {
        await interaction.editReply({
            content: `❌ ロールパネルを選択できませんでした！`
        })
    }
}