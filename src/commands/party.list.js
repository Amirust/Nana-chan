const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, time } = require('discord.js');
const Party = require('../structures/Party');
const chunk = require('../utils/chunk');

module.exports =
{
	info: {
		name: 'list'
	},
	parentOf: 'party',
	async execute( interaction, locale )
	{
		const errors = locale.errors;
		locale = locale.commands[ `${this.parentOf}.${this.info.name}` ];
		const dbParties = await bot.db.collection('parties').find().toArray();
		const parties = dbParties.filter( p => p.status !== 0 ).map( m => new Party( m ) );

		const collector = interaction.channel.createMessageComponentCollector({
			idle: 60000
		});
		collector.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		});

		let page = 0;
		const pages = chunk( parties, 2 );

		const listPrevFn = async ( i ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			if ( page > 0 )
			{
				page--;
				description = locale.embed.description.format([ parties.length ]);
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
				description = locale.embed.description.format([ parties.length ]);
				await renderPage(i, true);
			}
		};

		const buttonBackToListFn = async ( i ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			await renderPage(i, true);
		};

		const renderPartyInfo = async ( i ) =>
		{
			const id = i.values[0];
			const party = parties.find( p => p.id === id );
			if ( !party ) { return i.reply({ content: errors.NotFound, ephemeral: true }); }

			let infoDescription = locale.info.description.format([ time( new Date(party.date), 'R' ) ]);
			if ( party.meta.privacy.has('Owner') )
			{
				infoDescription += locale.info.owner.format([ `<@${party.owner}>` ]);
			}
			if ( party.meta.privacy.has('Members') )
			{
				party.members.push( party.owner );
				infoDescription += locale.info.members.format([ party.members.length, party.members.map( m => `<@${m}>` ).join(', ') ]) + '\n';
			}

			infoDescription += `\n${ party.meta.description.render() }`;

			const embed = new EmbedBuilder()
				.setTitle( locale.info.title.format([ party.name ]) )
				.setDescription( infoDescription )
				.setThumbnail( party.meta.icon )
				.setColor( bot.config.colors.embedBorder )
				.setFooter({ text: `ID: ${party.id}` });

			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId( `${interaction.id}.back.to.list` )
						.setLabel( locale.info.back )
						.setStyle('Primary')
						.setAction( buttonBackToListFn, collector )
				);

			return i.update({ embeds: [embed], components: [row] });
		};

		const renderPage = async ( i, isRerenderRequest = false ) =>
		{
			let description = locale.embed.description.format([ parties.length ]);

			for ( const party of pages[ page ] )
			{
				if ( !party ) { break; }
				const owner = await bot.client.users.fetch(party.owner);
				description += locale.embed.descriptionField.format([ party.id, party.name, time( new Date(party.date), 'R' ) ]);
				if ( party.meta.privacy.has('Owner') )
				{
					description += locale.embed.descriptionFieldOwner.format([ `<@${owner.id}>` ]);
				}
				if ( party.meta.privacy.has('Members') )
				{
					description += locale.embed.descriptionFieldMembers.format([ party.members.length + 1 ]);
				}
			}

			const embed = new EmbedBuilder()
				.setTitle( locale.embed.title.format([ interaction.guild.name ]) )
				.setDescription( description )
				.setColor( bot.config.colors.embedBorder )
				.setThumbnail( interaction.guild.iconURL({ size: 512, dynamic: true }) )
				.setFooter({ text: locale.embed.footer.format([ page + 1, pages.length ]) });

			const row = new ActionRowBuilder()
				.addComponents(
					new SelectMenuBuilder()
						.setCustomId(`${interaction.id}.party-list`)
						.setPlaceholder(locale.selectMenu.placeholder)
						.addOptions(
							pages[ page ].map( (p) => 
							{
								return {
									label: p.name,
									value: p.id,
									description: `${p.meta.privacy.has('Owner') ? locale.selectMenu.owner.format([ `${ (bot.client.users.cache.get(p.owner)).tag }` ]) : ''}${p.meta.privacy.has('Owner') ? ' | ' : ''}${p.meta.privacy.has('Members') ? locale.selectMenu.members.format([ p.members.length + 1 ]) : ''}`,
									emoji: '🔱'
								};
							} )
						)
						.setAction( renderPartyInfo, collector )
				);

			const buttonsRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(`${interaction.id}.party-list-prev`)
						.setEmoji('⬅️')
						.setStyle('Primary')
						.setDisabled(page === 0)
						.setAction( listPrevFn, collector ),

					new ButtonBuilder()
						.setCustomId(`${interaction.id}.party-list-next`)
						.setEmoji('➡️')
						.setStyle('Primary')
						.setDisabled(page === pages.length - 1)
						.setAction( listNextFn, collector )
				);

			if (pages.length > 1)
			{
				if (isRerenderRequest)
				{
					return await i.update({ embeds: [ embed ], components: [ row, buttonsRow ] });
				}
				return interaction.replied ?
					await interaction.editReply({ embeds: [embed], components: [row, buttonsRow] }) :
					await interaction.reply({ embeds: [embed], components: [row, buttonsRow] });
			}
			else
			{
				if (isRerenderRequest)
				{
					return await i.update({ embeds: [ embed ], components: [row] });
				}
				return interaction.replied ?
					await interaction.editReply({ embeds: [embed], components: [row] }) :
					await interaction.reply({ embeds: [embed], components: [row] });
			}
		};
        
        
		return await renderPage( interaction );
	}
};