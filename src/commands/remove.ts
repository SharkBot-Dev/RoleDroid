
import {
    ActionRowBuilder,
    ButtonBuilder,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";

import { selectedPanel } from "../cache/panel.js";

export const data = new SlashCommandBuilder()
    .setName("remove")
    .setDescription("ロールパネルからロールを削除します。")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption((option) =>
        option
            .setName("role")
            .setDescription("削除するロール")
            .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
    });

    if (!interaction.channel?.isSendable()) {
        await interaction.editReply({
            content: "❌ このチャンネルではロールパネルを操作できません。",
        });
        return;
    }

    try {
        const message = selectedPanel.get(interaction.channelId);

        if (!message) {
            await interaction.editReply({
                content:
                    "❌ ロールパネルが選択されていません。\n💡 `/select` で選択してください。",
            });
            return;
        }

        const originalMessage = await interaction.channel.messages.fetch({
            message: message
        })

        const originalEmbed = originalMessage.embeds[0];
        const component = originalMessage.components[0];

        if (
            !originalEmbed ||
            !component ||
            component.type !== ComponentType.ActionRow
        ) {
            await interaction.editReply({
                content: "❌ それはロールパネルではありません。",
            });
            return;
        }

        const role = interaction.options.getRole("role", true);

        const roleField = originalEmbed.fields.find(
            (field) => field.name === "ロール一覧"
        );

        if (!roleField) {
            await interaction.editReply({
                content: "❌ ロール一覧が見つかりません。",
            });
            return;
        }

        const roleMention = `<@&${role.id}>`;
        const lines = roleField.value
            .split("\n")
            .filter((line) => line.trim() !== roleMention);

        if (lines.length === roleField.value.split("\n").length) {
            await interaction.editReply({
                content: "❌ 指定されたロールはパネルに登録されていません。",
            });
            return;
        }

        const embed = EmbedBuilder.from(originalEmbed);

        embed.setFields(
            originalEmbed.fields.map((field) =>
                field.name === "ロール一覧"
                    ? {
                        ...field,
                        value: lines.join("\n").trim() || "❌このロールパネルは無効です。\n再度`/create`で作成し直してください。",
                    }
                    : field
            )
        );

        const targetCustomId = `rp_${role.id}`;
        const buttons = originalMessage.components.flatMap((row) =>
            row.type === ComponentType.ActionRow
                ? row.components
                    .flatMap((component) =>
                        component.type === ComponentType.Button &&
                        component.customId !== targetCustomId
                            ? [ButtonBuilder.from(component)]
                            : []
                    )
                : []
        );

        const components = [];

        for (let i = 0; i < buttons.length; i += 5) {
            components.push(
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(buttons.slice(i, i + 5))
            );
        }

        await originalMessage.edit({
            embeds: [embed],
            components,
        });

        await interaction.editReply({
            content: `✅ <@&${role.id}> をロールパネルから削除しました！`,
        });
    } catch {
        await interaction.editReply({
            content: `❌ ロールを削除できませんでした！`
        })
    }
}
