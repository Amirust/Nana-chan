const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require( 'discord.js' );
const Party = require( '../structures/Party' );

const modifyInit = require( './party.modifyInit' );

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
		if ( !( await Party.isOwner( interaction.member.id ) ) ) { return interaction.reply({ content: locale.NotIsOwner, ephemeral: true }); }

		const collector = interaction.channel.createMessageComponentCollector({
			idle: 60000
		});

		collector.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		});

		const party = await Party.get( interaction.member.id );

		await bot.client.guilds.fetch( '1030230451354353764' );
		await bot.client.guilds.cache.get( '1030230451354353764' ).channels.fetch();

		// Проверка на то не инициальный ли это вызов команды
		if ( party.status === 0 )
		{
			return await modifyInit.execute( interaction, locale, errors, party );
		}
    
		const returnToMenu = async ( i ) =>
		{
			const party = await Party.get( interaction.member.id );
    
			const embed = new EmbedBuilder()
				.setTitle( locale.embed.title.format( [ party.name ] ) )
				.setDescription( locale.embed.description.format( [ party.meta.course, party.meta.description.render() ] ) )
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
				await i.editReply({ embeds: [embed], components: [ row ] }) :
				await i.reply({ embeds: [embed], components: [ row ] });
		};
    
		const descriptionModalHandler = async ( i ) =>
		{
			if ( i.user.id !== interaction.user.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }

			party.meta.description = i.fields.getTextInputValue( `${interaction.id}.party.modify.description.input` );
			i.reply({ content: locale.DescriptionSetSuccess, ephemeral: true });
			await party.save();
			await returnToMenu( interaction );
		};

		const courseModalHandler = async ( i ) =>
		{
			if ( i.user.id !== interaction.user.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }

			party.meta.course = i.fields.getTextInputValue( `${interaction.id}.party.modify.course.input` );
			i.reply({ content: locale.CourseSetSuccess, ephemeral: true });
			await party.save();
			await returnToMenu( interaction );
		};
		const deleteModalHandler = async ( i ) =>
		{
			if ( i.user.id !== interaction.user.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }

			await party.delete();
			i.reply({ content: locale.DeleteSuccess, ephemeral: true });
			await collector.stop( 'deleteAnyway' );
		};
    
		const selectMenuHandler = async ( i ) =>
		{
			if ( i.user.id !== interaction.user.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }
            
			if ( i.values[0] === 'icon' )
			{
				await i.reply({ content: locale.init.loadImage, ephemeral: true });
    
				await i.channel.awaitMessages({ filter: m => m.author.id === interaction.user.id, max: 1, time: 30000, errors: ['time'] })
					.then( async m =>
					{
						if ( m.first().attachments.size === 0 && !m.first().content.startsWith( 'http' ) ) { return i.followUp({ content: locale.init.noImage, ephemeral: true }); }
						party.meta.icon = m.first().content.startsWith( 'http' ) ? m.first().content : ( await bot.client.guilds.cache.get( '1030230451354353764' ).channels.cache.get( '1030998656725299342' ).send({ files: [m.first().attachments.first().url] }) ).attachments.first().url;
						await party.save().then( () => i.followUp({ content: locale.AvatarInstalled, ephemeral: true }) );
						await m.delete();
						await returnToMenu( interaction );
					})
					.catch( () => { i.followUp({ content: errors.TimeOut, ephemeral: true }); returnToMenu( interaction ); });
			}
			if ( i.values[0] === 'description' )
			{
				const modal = new ModalBuilder()
					.setCustomId( `${interaction.id}.party.modify.description` )
					.setTitle( locale.init.modal.desctiptionTitle )
					.setAction( descriptionModalHandler, collector );
    
				const descriptionInput = new TextInputBuilder()
					.setCustomId( `${interaction.id}.party.modify.description.input` )
					.setLabel( 'Введите описание партии' )
					.setStyle( TextInputStyle.Paragraph )
					.setValue( party.meta.description.md || '' )
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
					.setTitle( locale.init.modal.courseTitle )
					.setAction( courseModalHandler, collector );
    
				const courseInput = new TextInputBuilder()
					.setCustomId( `${interaction.id}.party.modify.course.input` )
					.setLabel( locale.init.modal.courseLabel )
					.setStyle( TextInputStyle.Paragraph )
					.setValue( party.meta.course || '' )
					.setRequired( true )
					.setMaxLength( 50 )
					.setMinLength( 10 )
					.setPlaceholder( locale.init.modal.coursePlaceholder );
    
				modal.addComponents( new ActionRowBuilder().addComponents( courseInput ) );
				await i.showModal( modal );
			}
			if ( i.values[0] === 'delete' )
			{
				const modal = new ModalBuilder()
					.setCustomId( `${interaction.id}.party.modify.delete` )
					.setTitle( locale.init.modal.deleteTitle )
					.setAction( deleteModalHandler, collector );
    
				const courseInput = new TextInputBuilder()
					.setCustomId( `${interaction.id}.party.modify.delete.input` )
					.setLabel( locale.init.modal.deleteLabel )
					.setStyle( TextInputStyle.Paragraph )
					.setRequired( true )
					.setMaxLength( party.name.length )
					.setMinLength( party.name.length )
					.setPlaceholder( locale.init.modal.deletePlaceholder );
    
				modal.addComponents( new ActionRowBuilder().addComponents( courseInput ) );
				await i.showModal( modal );
			}
		};

		await returnToMenu( interaction );
	}
};