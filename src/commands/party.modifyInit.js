// Отдельный файл под инициальную настройку чтобы не перегружать основной файл

const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Party = require('../structures/Party');

module.exports = {
	info: {
		name: 'modifyInit',
	},
	parentOf: 'party',
	async execute ( interaction, locale, party )
	{
		const collector = interaction.channel.createMessageComponentCollector({
			idle: 60000
		});
		collector.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		});
    
		const returnToMenu = async ( i ) =>
		{
			const party = await Party.get( interaction.member.id );
    
			const embed = new EmbedBuilder()
				.setTitle( locale.init.embed.title.format([ party.name ]) )
				.setDescription( locale.init.embed.description.format([
					party.meta.icon ? '✅' : '❌',
					party.meta.description ? '✅' : '❌',
					party.meta.charter ? '✅' : '❌',
					party.meta.course ? '✅' : '❌',
				]) )
				.setThumbnail( party.meta.icon )
				.setColor( bot.config.colors.embedBorder );
    
			const row = new ActionRowBuilder()
				.addComponents(
					new SelectMenuBuilder()
						.setCustomId(`${interaction.id}.party.modify`)
						.setPlaceholder(locale.init.selectMenu.placeholder)
						.addOptions(locale.init.selectMenu.options)
						.setAction( initSelectMenuHandler, collector )
				);
                
    
			return await i.editReply({ embeds: [embed], components: [row] });
		};
    
		const descriptionModalHandler = async ( i ) =>
		{
			party.meta.description = i.fields.getTextInputValue(`${interaction.id}.party.modify.description.input`);
			i.reply({ content: locale.DescriptionSetSuccess, ephemeral: true });
			await party.save();
			await returnToMenu( interaction );
		};
    
		const initSelectMenuHandler = async ( i ) =>
		{
			if ( i.user.id !== interaction.user.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }
            
			if ( i.values[0] === 'icon' )
			{
				await i.reply({ content: locale.init.loadImage, ephemeral: true });
    
				await i.channel.awaitMessages( { filter: m => m.author.id === interaction.user.id, max: 1, time: 30000, errors: ['time'] } )
					.then(async m =>
					{
						if ( m.first().attachments.size === 0 && !m.first().content.startsWith('http') ) { return i.followUp({ content: locale.init.noImage, ephemeral: true }); }
						party.meta.icon = m.first().content.startsWith('http') ? m.first().content : ( await bot.client.guilds.cache.get('1030230451354353764').channels.cache.get('1030998656725299342').send({ files: [m.first().attachments.first().url] }) ).attachments.first().url;
						await party.save().then(() => i.followUp({ content: locale.AvatarInstalled, ephemeral: true }));
						await m.delete();
						await returnToMenu( interaction );
					})
					.catch( () => { i.followUp({ content: errors.TimeOut, ephemeral: true }); returnToMenu( i ); } );
			}
			if ( i.values[0] === 'description' )
			{
				const modal = new ModalBuilder()
					.setCustomId(`${interaction.id}.party.modify.description`)
					.setTitle('Описание партии')
					.setAction( descriptionModalHandler, collector );
    
				const descriptionInput = new TextInputBuilder()
					.setCustomId(`${interaction.id}.party.modify.description.input`)
					.setLabel('Введите описание партии')
					.setStyle(TextInputStyle.Paragraph);
    
				modal.addComponents(new ActionRowBuilder().addComponents( descriptionInput ));
				await i.showModal(modal);
			}
		};
    
		const embed = new EmbedBuilder()
			.setTitle( locale.init.embed.title.format([ party.name ]) )
			.setDescription( locale.init.embed.description.format([
				party.meta.icon ? '✅' : '❌',
				party.meta.description ? '✅' : '❌',
				party.meta.charter ? '✅' : '❌',
				party.meta.course ? '✅' : '❌',
			]) )
			.setThumbnail( party.meta.icon )
			.setColor( bot.config.colors.embedBorder );
    
		const row = new ActionRowBuilder()
			.addComponents(
				new SelectMenuBuilder()
					.setCustomId(`${interaction.id}.party.modify`)
					.setPlaceholder(locale.init.selectMenu.placeholder)
					.addOptions(locale.init.selectMenu.options)
					.setAction( initSelectMenuHandler, collector )
			);
            
    
		return interaction.reply({ embeds: [embed], components: [row] });
	}
};