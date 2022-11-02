// Отдельный файл под инициальную настройку чтобы не перегружать основной файл

const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder } = require( 'discord.js' );
const Party = require( '../structures/Party' );

module.exports = {
	info: {
		name: 'modifyInit',
	},
	parentOf: 'party',
	async execute ( interaction, locale, errors, party )
	{
		const collector = interaction.channel.createMessageComponentCollector( {
			idle: 60000
		} );
		collector.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		} );

		const initButtonHandler = async ( i ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			const party = await Party.get( interaction.member.id );
			party.status = 1;
			await party.save();
			
			await i.reply( { content: locale.init.Success, ephemeral: true } );
			collector.stop( 'deleteAnyway' );
		};
    
		const returnToMenu = async ( i ) =>
		{
			const party = await Party.get( interaction.member.id );
    
			const embed = new EmbedBuilder()
				.setTitle( locale.init.embed.title.format( [ party.name ] ) )
				.setDescription( locale.init.embed.description.format( [
					party.meta.icon ? '✅' : '❌',
					party.meta.description ? '✅' : '❌',
					party.meta.course ? '✅' : '❌'
				] ) )
				.setThumbnail( party.meta.icon )
				.setColor( bot.config.colors.embedBorder );
    
			const row = new ActionRowBuilder()
				.addComponents(
					new SelectMenuBuilder()
						.setCustomId( `${interaction.id}.party.modify` )
						.setPlaceholder( locale.init.selectMenu.placeholder )
						.addOptions( locale.init.selectMenu.options )
						.setAction( initSelectMenuHandler, collector )
				);

			const buttonsRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId( `${interaction.id}.party.modify.changeStatus` )
						.setLabel( locale.init.buttons.save )
						.setStyle( 'Success' )
						.setAction( initButtonHandler, collector )
						.setDisabled( !( party.meta.icon !== null && party.meta.description !== null && party.meta.course !== null ) )
				);
    
			return i.replied ?
				await i.editReply( { embeds: [embed], components: [ row, buttonsRow ] } ) :
				await i.reply( { embeds: [embed], components: [ row, buttonsRow ] } );
		};
    
		const descriptionModalHandler = async ( i ) =>
		{
			party.meta.description = i.fields.getTextInputValue( `${interaction.id}.party.modify.description.input` );
			i.reply( { content: locale.DescriptionSetSuccess, ephemeral: true } );
			await party.save();
			await returnToMenu( interaction );
		};

		const courseModalHandler = async ( i ) =>
		{
			party.meta.course = i.fields.getTextInputValue( `${interaction.id}.party.modify.course.input` );
			i.reply( { content: locale.CourseSetSuccess, ephemeral: true } );
			await party.save();
			await returnToMenu( interaction );
		};
    
		const initSelectMenuHandler = async ( i ) =>
		{
			if ( i.user.id !== interaction.user.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }
            
			if ( i.values[0] === 'icon' )
			{
				await i.reply( { content: locale.init.loadImage, ephemeral: true } );
    
				await i.channel.awaitMessages( { filter: m => m.author.id === interaction.user.id, max: 1, time: 30000, errors: ['time'] } )
					.then( async m =>
					{
						if ( m.first().attachments.size === 0 && !m.first().content.startsWith( 'http' ) ) { return i.followUp( { content: locale.init.noImage, ephemeral: true } ); }
						party.meta.icon = m.first().content.startsWith( 'http' ) ? m.first().content : ( await bot.client.guilds.cache.get( '1030230451354353764' ).channels.cache.get( '1030998656725299342' ).send( { files: [m.first().attachments.first().url] } ) ).attachments.first().url;
						await party.save().then( () => i.followUp( { content: locale.AvatarInstalled, ephemeral: true } ) );
						await m.delete();
						await returnToMenu( interaction );
					} )
					.catch( () => { i.followUp( { content: errors.TimeOut, ephemeral: true } ); returnToMenu( interaction ); } );
			}
			if ( i.values[0] === 'description' )
			{
				const modal = new ModalBuilder()
					.setCustomId( `${interaction.id}.party.modify.description` )
					.setTitle( 'Описание партии' )
					.setAction( descriptionModalHandler, collector );
    
				const descriptionInput = new TextInputBuilder()
					.setCustomId( `${interaction.id}.party.modify.description.input` )
					.setLabel( 'Введите описание партии' )
					.setStyle( TextInputStyle.Paragraph )
					.setRequired( true )
					.setMaxLength( 1000 )
					.setMinLength( 10 )
					.setPlaceholder( locale.init.modal.descriptionPlaceholder );
    
				modal.addComponents( new ActionRowBuilder().addComponents( descriptionInput ) );
				await i.showModal( modal );
			}
			if ( i.values[0] === 'course' )
			{
				const modal = new ModalBuilder()
					.setCustomId( `${interaction.id}.party.modify.course` )
					.setTitle( 'Описание партии' )
					.setAction( courseModalHandler, collector );
    
				const courseInput = new TextInputBuilder()
					.setCustomId( `${interaction.id}.party.modify.course.input` )
					.setLabel( locale.init.modal.courseLabel )
					.setStyle( TextInputStyle.Paragraph )
					.setRequired( true )
					.setMaxLength( 50 )
					.setMinLength( 10 )
					.setPlaceholder( locale.init.modal.coursePlaceholder );
    
				modal.addComponents( new ActionRowBuilder().addComponents( courseInput ) );
				await i.showModal( modal );
			}
		};

		await returnToMenu( interaction );
	}
};