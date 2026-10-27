import { ButtonInteraction, MessageFlags } from "discord.js";

export async function execute(interaction: ButtonInteraction) {
    if (!interaction.isButton()) return;

    if (!interaction.guild) return;

    try {
        const customId = interaction.customId;
        if (!customId.startsWith('rp_')) return;

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        const r_id = customId.split('rp_')[1];

        if (!r_id) return;

        const role = interaction.guild.roles.cache.get(r_id);

        if (!role) {
            await interaction.editReply({
                content: "❌ ロールが見つかりません。"
            })
            return;
        };

        if (!role.editable) {
            await interaction.editReply({
                content: "❌ そのロールは付与できません。"
            })
            return;
        };

            const member = interaction.guild.members.cache.get(interaction.user.id);

            if (!member) {
                await interaction.editReply({
                    content: "❌ メンバーが不明です。"
                })
                return;
            }

            const hasRole = member.roles.cache.some(role => role.id === r_id);

            if (hasRole) {
                await member.roles.remove(role);

                await interaction.editReply({
                    content: "✅️ ロールを剥奪しました。"
                })
            } else {
                await member.roles.add(role);

                await interaction.editReply({
                    content: "✅️ ロールを追加しました。"
                })
            }
        } catch (e) {
            await interaction.editReply({
                content: "❌ エラーが発生しました"
            })
            console.log(e)
            return;
        }
}

