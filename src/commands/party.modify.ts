import { Command } from '../types/Command';

import {
	EmbedBuilder,
	ActionRowBuilder,
	SelectMenuBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ButtonInteraction, ModalSubmitInteraction, SelectMenuInteraction
} from 'discord.js';
import Party from '../structures/Party';

import modifyInit from './party.modifyInit';

export const command: Command =
{
	info: {
		name: 'modify',
	},
	parentOf: 'party',
	async execute( interaction, rawlocale )
	{
		const errors = rawlocale.errors;
		const locale = rawlocale.commands[ `${this.parentOf}.${this.info.name}` ];

		// Проверка на то есть ли партии где участник является владельцем
		// @ts-ignore
		if ( !( await Party.isOwner( interaction.member.id ) ) ) { return interaction.reply( { content: locale.NotIsOwner, ephemeral: true } ); }

		// @ts-ignore
		const collector = interaction.channel.createMessageComponentCollector( {
			idle: 60000
		} );

		collector.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		} );

		// @ts-ignore
		const party = await Party.get( interaction.member.id );

		await bot.client.guilds.fetch( '1030230451354353764' );
		// @ts-ignore
		await bot.client.guilds.cache.get( '1030230451354353764' ).channels.fetch();

		// Проверка на то не инициальный ли это вызов команды
		// @ts-ignore
		if ( party.status === 0 )
		{
			return await modifyInit.execute( interaction, locale, errors, party );
		}
    
		const returnToMenu = async ( i: ButtonInteraction ) =>
		{
			// @ts-ignore
			const party = await Party.get( interaction.member.id );
    
			const embed = new EmbedBuilder()
				// @ts-ignore
				.setTitle( locale.embed.title.format( [ party.name ] ) )
				// @ts-ignore
				.setDescription( locale.embed.description.format( [ party.meta.course, party.meta.description.render() ] ) )
				// @ts-ignore
				.setThumbnail( party.meta.icon )
				.setColor( bot.config.colors.embedBorder );

			const row = new ActionRowBuilder()
				.addComponents(
					new SelectMenuBuilder()
						.setCustomId( `${interaction.id}.party.modify` )
						.setPlaceholder( locale.selectMenu.placeholder )
						.addOptions( locale.selectMenu.options )
						.setAction( selectMenuHandler, collector )
				);

			return i.replied ?
				// @ts-ignore
				await i.editReply( { embeds: [embed], components: [ row ] } ) :
				// @ts-ignore
				await i.reply( { embeds: [embed], components: [ row ] } );
		};
    
		const descriptionModalHandler = async ( i: ModalSubmitInteraction ) =>
		{
			if ( i.user.id !== interaction.user.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }

			// @ts-ignore
			party.meta.description = i.fields.getTextInputValue( `${interaction.id}.party.modify.description.input` );
			i.reply( { content: locale.DescriptionSetSuccess, ephemeral: true } );
			// @ts-ignore
			await party.save();
			// @ts-ignore
			await returnToMenu( interaction );
		};

		const courseModalHandler = async ( i: ModalSubmitInteraction ) =>
		{
			if ( i.user.id !== interaction.user.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }

			// @ts-ignore
			party.meta.course = i.fields.getTextInputValue( `${interaction.id}.party.modify.course.input` );
			i.reply( { content: locale.CourseSetSuccess, ephemeral: true } );
			// @ts-ignore
			await party.save();
			// @ts-ignore
			await returnToMenu( interaction );
		};
		const deleteModalHandler = async ( i: ModalSubmitInteraction ) =>
		{
			if ( i.user.id !== interaction.user.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }

			// @ts-ignore
			await party.delete();
			i.reply( { content: locale.DeleteSuccess, ephemeral: true } );
			await collector.stop( 'deleteAnyway' );
		};
    
		const selectMenuHandler = async ( i: SelectMenuInteraction ) =>
		{
			if ( i.user.id !== interaction.user.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }
            
			if ( i.values[0] === 'icon' )
			{
				await i.reply( { content: locale.init.loadImage, ephemeral: true } );

				// @ts-ignore
				await i.channel.awaitMessages( { filter: m => m.author.id === interaction.user.id, max: 1, time: 30000, errors: ['time'] } )
					.then( async ( m: any ) =>
					{
						if ( m.first().attachments.size === 0 && !m.first().content.startsWith( 'http' ) ) { return i.followUp( { content: locale.init.noImage, ephemeral: true } ); }
						// @ts-ignore
						party.meta.icon = m.first().content.startsWith( 'http' ) ? m.first().content : ( await bot.client.guilds.cache.get( '1030230451354353764' ).channels.cache.get( '1030998656725299342' ).send( { files: [m.first().attachments.first().url] } ) ).attachments.first().url;
						// @ts-ignore
						await party.save().then( () => i.followUp( { content: locale.AvatarInstalled, ephemeral: true } ) );
						await m.delete();
						// @ts-ignore
						await returnToMenu( interaction );
					} )
					// @ts-ignore
					.catch( () => { i.followUp( { content: errors.TimeOut, ephemeral: true } ); returnToMenu( interaction ); } );
			}
			if ( i.values[0] === 'description' )
			{
				const modal = new ModalBuilder()
					.setCustomId( `${interaction.id}.party.modify.description` )
					.setTitle( locale.init.modal.desctiptionTitle )
					// @ts-ignore
					.setAction( descriptionModalHandler, collector );
    
				const descriptionInput = new TextInputBuilder()
					.setCustomId( `${interaction.id}.party.modify.description.input` )
					.setLabel( 'Введите описание партии' )
					.setStyle( TextInputStyle.Paragraph )
					// @ts-ignore
					.setValue( party.meta.description.md || '' )
					.setRequired( true )
					.setMaxLength( 1000 )
					.setMinLength( 10 )
					.setPlaceholder( locale.init.modal.descriptionPlaceholder );

				// @ts-ignore
				modal.addComponents( new ActionRowBuilder().addComponents( descriptionInput ) );
				await i.showModal( modal );
			}
			if ( i.values[0] === 'course' )
			{
				const modal = new ModalBuilder()
					.setCustomId( `${interaction.id}.party.modify.course` )
					.setTitle( locale.init.modal.courseTitle )
					// @ts-ignore
					.setAction( courseModalHandler, collector );
    
				const courseInput = new TextInputBuilder()
					.setCustomId( `${interaction.id}.party.modify.course.input` )
					.setLabel( locale.init.modal.courseLabel )
					.setStyle( TextInputStyle.Paragraph )
					// @ts-ignore
					.setValue( party.meta.course || '' )
					.setRequired( true )
					.setMaxLength( 50 )
					.setMinLength( 10 )
					.setPlaceholder( locale.init.modal.coursePlaceholder );

				// @ts-ignore
				modal.addComponents( new ActionRowBuilder().addComponents( courseInput ) );
				await i.showModal( modal );
			}
			if ( i.values[0] === 'delete' )
			{
				const modal = new ModalBuilder()
					.setCustomId( `${interaction.id}.party.modify.delete` )
					.setTitle( locale.init.modal.deleteTitle )
					// @ts-ignore
					.setAction( deleteModalHandler, collector );
    
				const courseInput = new TextInputBuilder()
					.setCustomId( `${interaction.id}.party.modify.delete.input` )
					.setLabel( locale.init.modal.deleteLabel )
					.setStyle( TextInputStyle.Paragraph )
					.setRequired( true )
					// @ts-ignore
					.setMaxLength( party.name.length )
					// @ts-ignore
					.setMinLength( party.name.length )
					.setPlaceholder( locale.init.modal.deletePlaceholder );

				// @ts-ignore
				modal.addComponents( new ActionRowBuilder().addComponents( courseInput ) );
				await i.showModal( modal );
			}
		};

		// @ts-ignore
		await returnToMenu( interaction );
	}
};