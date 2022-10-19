const { EmbedBuilder } = require('discord.js');
const Party = require('../structures/Party');

module.exports =
{
	info: {
		name: 'kick',
	},
	parentOf: 'party',
	async execute( interaction, locale )
	{
		const errors = locale.errors;
		locale = locale.commands[ `${this.parentOf}.${this.info.name}` ];

		const member = interaction.options.get('user')?.member;
        await interaction.guild.members.fetch( member?.id );

		// Проверка на то есть ли пользователь на сервере
		if ( !member )
		{
			return interaction.reply({ content: errors.UserNotFound, ephemeral: true });
		}
		if ( member.id === interaction.user.id )
		{
			return interaction.reply({ content: locale.DontKickSelf, ephemeral: true });
		}
		// Проверка на то есть ли партия у пользователя
		if ( !( await Party.isOwner( interaction.user.id ) ) )
		{
			return interaction.reply({ content: locale.NoParty, ephemeral: true });
		}

		const party = await Party.get( interaction.member.id );

		// Проверка на то являеться ли переданный юзер участником партии
		if ( !party.members.includes( member.id ) )
		{
			return interaction.reply({ content: locale.UserNoInParty, ephemeral: true });
		}

		const embed = new EmbedBuilder()
			.setTitle( locale.embed.title )
			.setDescription( locale.embed.description.format([ `<@${member.id}>`, `<@${interaction.user.id}>`, party.name ]) )
			.setColor( bot.config.colors.embedBorder )
			.setThumbnail( party.meta.icon );

		await party.removeMember( member.id );
		await member.roles.remove(party.roleId);

		await interaction.reply({ embeds: [embed] });
	}
};