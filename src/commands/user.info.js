const { EmbedBuilder } = require('discord.js');
const Marriage = require('../structures/Marriage');
const Party = require('../structures/Party');
const UserReputation = require('../structures/UserReputation');

module.exports =
{
	info: {
		name: 'userinfo',
		description: 'Получить информацию о пользователе',
		options: [{
			name: 'user',
			description: 'Укажите пользователя',
			type: 6,
			required: false
		}]
	},
	async execute( interaction, locale )
	{
		locale = locale.commands[ this.info.name ];

		const member = interaction.options.get('user')?.member || interaction.member;

		const marriage = await Marriage.get(member.id);
		const party = await Party.get(member.id);
		const reputation = await UserReputation.get(member.id);

		let description = '';

		if ( marriage )
		{
			description += locale.embed.marryDescription.format([ `<@${marriage.initializer === member.id ? marriage.target : marriage.initializer}>` ]);
		}

		if ( party )
		{
			description += locale.embed.partyDescription.format([ party.name ]);
		}

		description += locale.embed.reputationDescription.format([ reputation.reputation ]);

		const embed = new EmbedBuilder()
			.setAuthor({ name: member.user.tag, iconURL: member.user.avatarURL({ size: 256, dynamic: true }) })
			.setDescription( description )
			.setColor( bot.config.colors.embedBorder );

		return interaction.reply({ embeds: [embed] });
	}
};