import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, CommandInteraction, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { sleep } from "../lib/sleep.js";
import { selectedPanel } from "../cache/panel.js";

export const data = (
    new SlashCommandBuilder()
    .setName("create")
    .setDescription("ロールパネルを作成します。")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption((role) => role.setName("role").setDescription("最初に追加するロール").setRequired(true))
    .addStringOption((title) => title.setName("title").setDescription("ロールパネルのタイトル").setRequired(false))
    .addStringOption((title) => title.setName("description").setDescription("ロールパネルの説明").setRequired(false))
)

export async function execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply({
        flags: MessageFlags.Ephemeral
    })

    if (!interaction.channel?.isSendable()) {
        await interaction.followUp({
            flags: MessageFlags.Ephemeral,
            content: "❌ロールパネルを作成できるチャンネルではありません。"
        })
        return
    }

    try {
        const title = interaction.options.getString("title", false)
        const description = interaction.options.getString("description", false)
        const role = interaction.options.getRole("role", true)

        const embed = new EmbedBuilder().setTitle(title).setDescription(description).addFields({
            name: "ロール一覧",
            value: `<@&${role.id}>`
        }).setColor(Colors.Green)

        const message = await interaction.channel.send({
            embeds: [embed]
        })

        await sleep(1000)

        embed.setFooter({
            text: `${message.id}`
        })

        let actionRow = new ActionRowBuilder<ButtonBuilder>();
        actionRow.addComponents(new ButtonBuilder({
            label: role.name,
            custom_id: `rp_${role.id}`,
            style: ButtonStyle.Secondary
        }));

        await message.edit({
            embeds: [embed],
            components: [actionRow]
        })

        selectedPanel.set(interaction.channelId, message.id)

        await interaction.followUp({
            flags: MessageFlags.Ephemeral,
            content: "✅️作成しました！"
        })
    } catch {
        await interaction.editReply({
            content: `❌ ロールパネルを作成できませんでした！`
        })
    }
}