import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, ComponentType, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { selectedPanel } from "../cache/panel.js";

export const data = (
    new SlashCommandBuilder()
    .setName("add")
    .setDescription("ロールパネルにロールを追加します。")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption((role) => role.setName("role").setDescription("追加するロール").setRequired(true))
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
        const messageId = selectedPanel.get(interaction.channelId)

        if (!messageId) {
            await interaction.followUp({
                flags: MessageFlags.Ephemeral,
                content: "❌ロールパネルが選択されていません。\n💡`/select`で選択できます。"
            })
            return
        }

        const message = await interaction.channel.messages.fetch({
            message: messageId
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
        
        const role = interaction.options.getRole("role", true)

        const embed = EmbedBuilder.from(message.embeds[0]);
        embed.setFields({
            name: "ロール一覧",
            value: message.embeds[0].fields[0]?.value + `\n<@&${role.id}>`
        })

        const buttons = message.components.flatMap((row) =>
            row.type === ComponentType.ActionRow
                ? row.components
                    .filter((component) => component.type === ComponentType.Button)
                    .map((component) => ButtonBuilder.from(component))
                : []
        );

        buttons.push(
            new ButtonBuilder()
                .setLabel(role.name)
                .setCustomId(`rp_${role.id}`)
                .setStyle(ButtonStyle.Secondary)
        );

        const components = [];

        for (let i = 0; i < buttons.length; i += 5) {
            components.push(
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(buttons.slice(i, i + 5))
            );
        }

        await message.edit({
            embeds: [embed],
            components,
        });

        await interaction.editReply({
            content: `✅️ <@&${role.id}> をロールパネルに追加しました！`
        })
    } catch {
        await interaction.editReply({
            content: `❌ ロールを追加できませんでした！`
        })
    }
}