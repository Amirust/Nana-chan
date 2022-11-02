const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, time } = require('discord.js');
const Marriage = require('../structures/Marriage');
const chunk = require('../utils/chunk');

module.exports =
{
	info: {
		name: 'list'
	},
	parentOf: 'marry',
	async execute( interaction, locale )
	{
        const errors = locale.errors;
		locale = locale.commands[ `${this.parentOf}.${this.info.name}` ];
		const dbMarriages = await bot.db.collection('marriages').find().toArray();
		const marriages = dbMarriages.map( m => new Marriage( m ) );

		const message = await interaction.deferReply();

		const collector = await message.createMessageComponentCollector({
			idle: 60000
		});
		collector.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		});

		let page = 0;
		const pages = chunk( marriages, 2 );

		const listPrevFn = async ( i ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			if ( page > 0 )
			{
				page--;
				await renderPage(i, true);
			}
		};

		const listNextFn = async ( i ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			if ( page < pages.length - 1 )
			{
				page++;
				await renderPage(i, true);
			}
		};

		const renderPage = async ( i, isRerenderRequest = false ) =>
		{
            const buttonsRow = new ActionRowBuilder()
                .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`${interaction.id}.marry-list-prev`)
                            .setEmoji('⬅️')
                            .setStyle('Primary')
                            .setDisabled(page === 0),

                        new ButtonBuilder()
                            .setCustomId(`${interaction.id}.marry-list-next`)
                            .setEmoji('➡️')
                            .setStyle('Primary')
                            .setDisabled(page === pages.length - 1)
                        );

			let description = locale.embed.description.format([ marriages.length ]);
			for ( const marriage of pages[page] )
			{
				if ( !marriage ) { break; }
				description += locale.embed.descriptionField.format([ marriage.id, `<@${marriage.initializer}>`, `<@${marriage.target}>`, time( new Date(marriage.date), 'R' ) ]);
			}

			const embed = new EmbedBuilder()
				.setTitle( locale.embed.title.format([ interaction.guild.name ]) )
				.setDescription( description )
				.setColor( bot.config.colors.embedBorder )
				.setThumbnail( interaction.guild.iconURL({ size: 512, dynamic: true }) );

			if (pages.length > 1)
			{
				if (isRerenderRequest)
				{
					return await i.update({ embeds: [ embed ], components: [ buttonsRow ] });
				}
				return interaction.replied || interaction.deferred  ?
					await interaction.editReply({ embeds: [embed], components: [buttonsRow] }) :
					await interaction.reply({ embeds: [embed], components: [buttonsRow] });
			}
			else
			{
				if (isRerenderRequest)
				{
					return await i.update({ embeds: [ embed ] });
				}
				return interaction.replied || interaction.deferred ?
					await interaction.editReply({ embeds: [embed] }) :
					await interaction.reply({ embeds: [embed] });
			}
		};
        
		collector.on('collect', async (i) =>
		{
			// Кнопачки пагинатора
			if ( i.customId === `${interaction.id}.marry-list-prev` ) { await listPrevFn(i); }
			if ( i.customId === `${interaction.id}.marry-list-next` ) { await listNextFn(i); }
		});

		await renderPage();
	}
};