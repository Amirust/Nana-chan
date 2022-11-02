const ruPermissions = require( '../assets/ru_permissions.json' );
const { Localization } = require( '../types/Localization' );
const { Snowflake, CommandInteraction } = require( 'discord.js' );
const { Command } = require( '../types/Command' );

function localizator( locale ) : Localization
{
	try
	{
	    return require( `../localization/${locale}.json` );
	}
	catch ( e )
	{
		return require( '../localization/ru.json' );
	}
}

class CommandsController
{
	constructor( commands )
	{
		this.commands = commands;
	}

	async process( interaction, locale ) : Promise<void>
	{
		interaction = await interaction;
		const command = this.getCommand( interaction.commandName );

		// Альфа тест скам
		// if ( !bot.config.alphaTesters.includes( interaction.user.id ) ) { return interaction.reply({ content: 'Эта команда находится в альфа-тестировании и доступна только альфа-тестерам', ephemeral: true }); }

		// Скам если бот в альфе
		if ( bot.client.user.id === bot.config.alphaId && !bot.config.owners.includes( interaction.user.id ) ) { return interaction.reply( { content: `Видишь себя в этом списке?\n${ ( await Promise.all( bot.config.owners.map( async id => await bot.client.users.fetch( id ) ) ).then( res => res.map( u => u.tag ) ) ).join( ', ' ) }\nИ я нет, по этому катись нахуй.`, ephemeral: true } ); }

		// Авто-комлпит
		if ( interaction?.isAutocomplete() )
		{
			return await command.executeAC( interaction, localizator( locale ) );
		}

		// Контекстные команды 
		if ( interaction?.isContextMenuCommand() )
		{
			return await command.execute( interaction, localizator( locale ) );
		}

		// Обычные команды
		if ( interaction?.isChatInputCommand() )
		{
			if ( command.permissions?.length > 0 ) // Проверка прав
			{
				if ( !interaction.member.permissions.toArray().every( ( p ) => command.permissions.includes( p ) ) && !interaction.member.permissions.has( 'Administrator' ) && !( interaction.guild.ownerId === interaction.member.id ) )
				{
					const requiredPerms = [];
					command.permissions.map( ( prop ) =>
						requiredPerms.push( ruPermissions[ prop ] )
					);
					return interaction.reply( { content: `<:firewall:1028383375444168815> У вас нет на это требуемых прав!\nТребуемые права: ${requiredPerms.map( ( prop ) =>
					{
						return `\`${prop}\``;
					} ).join( ', ' )} // Вам не хватает: ${requiredPerms.filter( ( prop ) => !interaction.member.permissions.toArray().includes( prop ) ).map( ( prop ) =>
					{
						return `\`${prop}\``;
					} ).join( ', ' )}`, ephemeral: true } );
				}
			}

			try
			{
				if ( interaction.options?.getSubcommand( false ) !== null )
				{
					const subcommand = this.getSubCommand( interaction.commandName, interaction.options.getSubcommand() );
					if ( subcommand ) { return await subcommand.execute( interaction, localizator( locale ) ); }
				}

				return await command.execute( interaction, localizator( locale ) );
			}
			catch ( e )
			{
				console.log( e );
				return interaction.replied ?
					interaction.editReply( { content: `Произошла ошибка!\n\`\`\`js\nSlashCommand ERROR\nCommand: ${interaction.commandName}\n${e.stack}\`\`\``, ephemeral: true } ) :
					interaction.reply( { content: `Произошла ошибка!\n\`\`\`js\nSlashCommand ERROR\nCommand: ${interaction.commandName}\n${e.stack}\`\`\``, ephemeral: true } );
			}
		}
	}

	async create( command: string, guild?: Snowflake ): Promise<CommandInteraction>
	{
		const cmd = this.getCommand( command );
		if ( !cmd ) { return 'Нету такой команды'; }

		if ( cmd.info?.type > 1 ) { delete cmd.info.description; }

		if ( guild ) { return bot.client.application.commands.create( cmd.info, guild ); }
		else { return bot.client.application.commands.create( cmd.info ); }

	}

	async remove( command: Snowflake, guild?: Snowflake ): Promise<CommandInteraction>
	{
		const commandId = /^[0-9]{17,19}$/gm.test( command ) ? command : ( await bot.client.application.commands.fetch() ).find( ( cmd ) => cmd.name === command ).id;
		if ( !commandId ) { return 'Нету такой команды'; }

		if ( guild ) { return await bot.client.application.commands.delete( commandId, guild ); }
		else { return await bot.client.application.commands.delete( commandId ); }
	}

	async sync( guild?: Snowflake | null ): Promise<Array<CommandInteraction>>
	{
		const commands = this.commands
			.filter( ( cmd ) => !cmd.parentOf ) // Если это файл субкоманды то не будет деплоится (Должен деплоится только файл декларации)
			.map( cmd => cmd.info ) // Пихаем только поле info
			.filter( ( cmd ) => !cmd?.local || false ); // Если команда отмечена как локальная то не будет деплоится при синхронизации

		if ( guild ) { return await bot.client.application.commands.set( commands, guild ); }
		return await bot.client.application.commands.set( commands );
	}

	getCommand( name ): Command
	{
		return this.commands.find( ( command ) => command?.info.name === name );
	}

	getSubCommand( category, name ): Command
	{
		return this.commands.find( c => c.info.name === name && c.parentOf === category );
	}
}

export default CommandsController;