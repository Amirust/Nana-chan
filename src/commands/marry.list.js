const { EmbedBuilder, time } = require('discord.js');
const Marriage = require('../structures/Marriage');

module.exports =
{
	info: {
		name: 'list'
	},
	parentOf: 'marry',
	async execute( interaction, locale )
	{
		locale = locale.commands[ `${this.parentOf}.${this.info.name}` ];
		const dbMarriages = await bot.db.collection('marriages').find().toArray();
		const marriages = dbMarriages.map( m => new Marriage( m ) );

		let description = locale.embed.description.format([ marriages.length ]);
		for ( let i = 0; i < 10; i++ )
		{
			const marriage = marriages[ i ];
			if ( !marriage ) { break; }
			description += locale.embed.descriptionField.format([ marriage.id, `<@${marriage.initializer}>`, `<@${marriage.target}>`, time( new Date(marriage.date), 'R' ) ]);
		}

		const embed = new EmbedBuilder()
			.setTitle( locale.embed.title.format([ interaction.guild.name ]) )
			.setDescription( description )
			.setColor( bot.config.colors.embedBorder )
			.setThumbnail( interaction.guild.iconURL({ size: 512, dynamic: true }) );
        
		return interaction.reply({ embeds: [embed] });
	}
};