const Party = require( '../structures/Party' );

module.exports =
{
	info: {
		name: 'leave',
	},
	parentOf: 'party',
	async execute( interaction, locale )
	{
		locale = locale.commands[ `${this.parentOf}.${this.info.name}` ];

		// Проверка на то есть ли партия у пользователя
		if ( !( await Party.isPartyMember( interaction.user.id ) ) )
		{
			return interaction.reply( { content: locale.NoParty, ephemeral: true } );
		}

		// Проверка на владельца
		if ( await Party.isOwner( interaction.user.id ) )
		{
			return interaction.reply( { content: locale.YouOwner, ephemeral: true } );
		}

		const party = await Party.get( interaction.member.id );

		await party.removeMember( interaction.member.id );
		await interaction.member.roles.remove( party.roleId );

		await interaction.reply( { content: locale.Success.format( [ `<@${interaction.member.id}>`, party.name ] ) } );
	}
};