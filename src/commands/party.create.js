const { EmbedBuilder, time } = require('discord.js');
const Party = require('../structures/Party');

module.exports =
{
	info: {
		name: 'create',
	},
	parentOf: 'party',
	async execute( interaction, locale )
	{
		locale = locale.commands[ `${this.parentOf}.${this.info.name}` ];
		const name = interaction.options.getString('name');

		// Проверка на то можно ли участнику создавать партии
		// if ( !interaction.member.roles.cache.has('925061751572144199') ) { return interaction.reply({ content: locale.NoPermission, ephemeral: true }); }
		// Проверка на то участник ли существующей партии автор итерации
		if ( await Party.isPartyMember( interaction.member.id ) ) { return interaction.reply({ content: locale.AlreadyInParty, ephemeral: true }); }
		// Проверка на существование партии с таким именем
		if ( await Party.isNameOccupied( name ) ) { return interaction.reply({ content: locale.PartyNameOccupied, ephemeral: true }); }
		// Проверка на то есть ли у автора итерации активные запросы на создание партии
		if ( bot.store.activePartyCreationRequests.has( interaction.user.id ) )
		{
			const request = bot.store.activePartyCreationRequests.get( interaction.user.id );
			if ( !request.createdAt + 1000 * 60 < Date.now() )
			{
				return interaction.reply({
					content: locale.AlreadyHasRequest.format([ time( new Date(request.createdAt + 1000 * 60), 'R' ) ]), 
					ephemeral: true
				});
			}
			else { bot.store.activePartyCreationRequests.delete( interaction.user.id ); }
		}

		const party = Party.create( interaction.user.id, name );
		party.save();

		const embed = new EmbedBuilder()
			.setTitle( locale.embed.title.format([ name ]) )
			.setDescription( locale.embed.description )
			.setColor( bot.config.colors.embedBorder )
			.setThumbnail( interaction.user.avatarURL({ size: 512, dynamic: true }) );

		return interaction.reply({ embeds: [embed] });
	}
};