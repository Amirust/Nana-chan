const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, time } = require( 'discord.js' );
const Party = require( '../structures/Party' );
const UserReputation = require( '../structures/UserReputation' );
const chunk = require( '../utils/chunk' );

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
		const dbParties = await bot.db.collection( 'parties' ).find().toArray();
		const parties = dbParties.filter( p => p.status !== 0 ).map( m => new Party( m ) );

		if ( parties.length <= 0 )
		{
			return interaction.reply({ content: locale.NoParties, ephemeral: true });
		}

		const message = await interaction.deferReply();

		const collector = await message.createMessageComponentCollector({
			idle: 60000
		});
		collector.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		});

		let page = 0;
		const pages = chunk( parties, 5 );

		const listPrevFn = async ( i ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			if ( page > 0 )
			{
				page--;
				await renderPage( i, true );
			}
		};

		const listNextFn = async ( i ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			if ( page < pages.length - 1 )
			{
				page++;
				await renderPage( i, true );
			}
		};

		const buttonBackToListFn = async ( i ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			await renderPage( i, true );
		};

		const renderPartyInfo = async ( i ) =>
		{
			const id = i.values[0];
			const party = parties.find( p => p.id === id );
			const members = party.members.concat( [ party.owner ] );

			const reputations = await UserReputation.getMany( members );
			const reputationSum = reputations.reduce( ( acc, cur ) => acc + Number( cur.reputation ), 0 );

			if ( !party ) { return i.reply({ content: errors.NotFound, ephemeral: true }); }

			let infoDescription = locale.info.description.format( [ time( new Date( party.date ), 'R' ), party.meta.course, reputationSum] );
			if ( party.meta.privacy.has( 'Owner' ) )
			{
				infoDescription += locale.info.owner.format( [ `<@${party.owner}>` ] );
			}
			if ( party.meta.privacy.has( 'Members' ) )
			{
				infoDescription += locale.info.members.format( [ members.length, members.map( m => `[${reputations.find( rec => rec.id === m ).reputation}] <@${m}>` ).join( '\n' ) ] ) + '\n';
			}

			infoDescription += `\n${ party.meta.description.render() }`;

			const embed = new EmbedBuilder()
				.setTitle( locale.info.title.format( [ party.name ] ) )
				.setDescription( infoDescription )
				.setThumbnail( party.meta.icon )
				.setColor( bot.config.colors.embedBorder )
				.setFooter({ text: `ID: ${party.id}` });

			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId( `${interaction.id}.back.to.list` )
						.setLabel( locale.info.back )
						.setStyle( 'Primary' )
				);

			return i.update({ embeds: [embed], components: [row] });
		};

		const renderPage = async ( i, isRerenderRequest = false ) =>
		{
			let description = locale.embed.description.format( [ parties.length ] );

			for ( const party of pages[ page ] )
			{
				if ( !party ) { break; }
				const owner = await bot.client.users.fetch( party.owner );
				description += locale.embed.descriptionField.format( [ party.id, party.name, time( new Date( party.date ), 'R' ) ] );
				if ( party.meta.privacy.has( 'Owner' ) )
				{
					description += locale.embed.descriptionFieldOwner.format( [ `<@${owner.id}>` ] );
				}
				if ( party.meta.privacy.has( 'Members' ) )
				{
					description += locale.embed.descriptionFieldMembers.format( [ party.members.length + 1 ] );
				}
			}

			const embed = new EmbedBuilder()
				.setTitle( locale.embed.title.format( [ interaction.guild.name ] ) )
				.setDescription( description )
				.setColor( bot.config.colors.embedBorder )
				.setThumbnail( interaction.guild.iconURL({ size: 512, dynamic: true }) )
				.setFooter({ text: locale.embed.footer.format( [ page + 1, pages.length ] ) });

			const row = new ActionRowBuilder()
				.addComponents(
					new SelectMenuBuilder()
						.setCustomId( `${interaction.id}.party-list` )
						.setPlaceholder( locale.selectMenu.placeholder )
						.addOptions(
							pages[ page ].map( ( p ) =>
							{
								return {
									label: p.name,
									value: p.id,
									description: `${p.meta.privacy.has( 'Owner' ) ? locale.selectMenu.owner.format( [ `${ ( bot.client.users.cache.get( p.owner ) ).tag }` ] ) : ''}${p.meta.privacy.has( 'Owner' ) ? ' | ' : ''}${p.meta.privacy.has( 'Members' ) ? locale.selectMenu.members.format( [ p.members.length + 1 ] ) : ''}`,
									emoji: '🔱'
								};
							})
						)
				);

			const buttonsRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId( `${interaction.id}.party-list-prev` )
						.setEmoji( '⬅️' )
						.setStyle( 'Primary' )
						.setDisabled( page === 0 ),

					new ButtonBuilder()
						.setCustomId( `${interaction.id}.party-list-next` )
						.setEmoji( '➡️' )
						.setStyle( 'Primary' )
						.setDisabled( page === pages.length - 1 )
				);

			if ( pages.length > 1 )
			{
				if ( isRerenderRequest )
				{
					return i.update({ embeds: [ embed ], components: [ row, buttonsRow ] });
				}
				return interaction.replied || interaction.deferred  ?
					await interaction.editReply({ embeds: [embed], components: [row, buttonsRow] }) :
					await interaction.reply({ embeds: [embed], components: [row, buttonsRow] });
			}
			else
			{
				if ( isRerenderRequest )
				{
					return i.update({ embeds: [ embed ], components: [row] });
				}
				return interaction.replied || interaction.deferred ?
					await interaction.editReply({ embeds: [embed], components: [row] }) :
					await interaction.reply({ embeds: [embed], components: [row] });
			}
		};

		collector.on( 'collect', async ( i ) =>
		{
			// Кнопачки пагинатора
			if ( i.customId === `${interaction.id}.party-list-prev` ) { await listPrevFn( i ); }
			if ( i.customId === `${interaction.id}.party-list-next` ) { await listNextFn( i ); }

			// Селект меню списка партий
			if ( i.customId === `${interaction.id}.party-list` ) { await renderPartyInfo( i ); }

			// Возврат из инфо
			if ( i.customId === `${interaction.id}.back.to.list` ) { await buttonBackToListFn( i ); }
		});

		return renderPage( interaction );
	}
};