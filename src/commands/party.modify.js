const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Party = require('../structures/Party');

const modifyInit = require('./party.modifyInit');

module.exports =
{
	info: {
		name: 'modify',
	},
	parentOf: 'party',
	async execute( interaction, locale )
	{
		const errors = locale.errors;
		locale = locale.commands[ `${this.parentOf}.${this.info.name}` ];

		// Проверка на то есть ли партии где участник является владельцем
		if ( !(await Party.isOwner( interaction.member.id )) ) { return interaction.reply({ content: locale.NotIsOwner, ephemeral: true }); }
        
		const party = await Party.get( interaction.member.id );

		await bot.client.guilds.fetch('1030230451354353764');
		await bot.client.guilds.cache.get('1030230451354353764').channels.fetch();

		// Проверка на то не инициальный ли это вызов команды
		if ( party.status === 0 )
		{
			return await modifyInit.execute( interaction, locale, errors, party );
		}

		const row = new ActionRowBuilder()
			.addComponents(
				new SelectMenuBuilder()
					.setCustomId(`${interaction.id}.party.modify`)
					.setPlaceholder(locale.selectMenu.placeholder)
					.addOptions(locale.selectMenu.options)
			);
		return interaction.reply({ content: '** **', components: [] });
	}
};