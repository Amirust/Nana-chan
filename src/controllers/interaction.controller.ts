// @ts-ignore
import ruPermissions from '../assets/ru_permissions.json';
import { Localization } from '../types/Localization';
import { Snowflake, CommandInteraction, Collection } from 'discord.js';
import { Command } from '../types/Command';

function localizator( locale: string ) : Localization
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
	public commands: Collection<string, Command> = new Collection();

	constructor( commands: Collection<string, Command> )
	{
		this.commands = commands;
	}

	async process( interaction: CommandInteraction, locale: string ) : Promise<any>
	{
		interaction = await interaction;
		const command = this.getCommand( interaction.commandName );

		// Альфа тест скам
		// if ( !bot.config.alphaTesters.includes( interaction.user.id ) ) { return interaction.reply({ content: 'Эта команда находится в альфа-тестировании и доступна только альфа-тестерам', ephemeral: true }); }

		// Скам если бот в альфе
		// @ts-ignore
		if ( bot.client.user.id === bot.config.alphaId && !bot.config.owners.includes( interaction.user.id ) ) { return interaction.reply( { content: `Видишь себя в этом списке?\n${ ( await Promise.all( bot.config.owners.map( async id => await bot.client.users.fetch( id ) ) ).then( res => res.map( u => u.tag ) ) ).join( ', ' ) }\nИ я нет, по этому катись нахуй.`, ephemeral: true } ); }

		// Авто-комлпит
		if ( interaction?.isAutocomplete() )
		{
			// @ts-ignore
			return await command.executeAC( interaction, localizator( locale ) );
		}

		// Контекстные команды 
		if ( interaction?.isContextMenuCommand() )
		{
			// @ts-ignore
			return await command.execute( interaction, localizator( locale ) );
		}

		// Обычные команды
		if ( interaction?.isChatInputCommand() )
		{
			// @ts-ignore
			if ( command.permissions?.length > 0 ) // Проверка прав
			{
				// @ts-ignore
				if ( !interaction.member.permissions.toArray().every( ( p ) => command.permissions.includes( p ) ) && !interaction.member.permissions.has( 'Administrator' ) && !( interaction.guild.ownerId === interaction.member.id ) )
				{
					const requiredPerms: Array<string> = [];
					// @ts-ignore
					command.permissions.map( ( prop: string ) =>
						// @ts-ignore
						requiredPerms.push( ruPermissions[ prop ] )
					);
					return interaction.reply( { content: `<:firewall:1028383375444168815> У вас нет на это требуемых прав!\nТребуемые права: ${requiredPerms.map( ( prop ) =>
					{
						return `\`${prop}\``;
						// @ts-ignore
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

				// @ts-ignore
				return await command.execute( interaction, localizator( locale ) );
			}
			catch ( e: any )
			{
				console.log( e );
				return interaction.replied ?
					interaction.editReply( { content: `Произошла ошибка!\n\`\`\`js\nSlashCommand ERROR\nCommand: ${interaction.commandName}\n${e.stack}\`\`\`` } ) :
					interaction.reply( { content: `Произошла ошибка!\n\`\`\`js\nSlashCommand ERROR\nCommand: ${interaction.commandName}\n${e.stack}\`\`\``, ephemeral: true } );
			}
		}
	}

	async create( command: string, guild?: Snowflake ): Promise<CommandInteraction>
	{
		const cmd = this.getCommand( command );
		if ( !cmd ) { throw new Error( 'Нету такой команды' ); }

		// @ts-ignore
		if ( cmd.info?.type > 1 ) { delete cmd.info.description; }

		// @ts-ignore
		if ( guild ) { return bot.client.application.commands.create( cmd.info, guild ); }
		// @ts-ignore
		else { return bot.client.application.commands.create( cmd.info ); }

	}

	async remove( command: Snowflake, guild?: Snowflake ): Promise<CommandInteraction>
	{
		// @ts-ignore
		const commandId = /^[0-9]{17,19}$/gm.test( command ) ? command : ( await bot.client.application.commands.fetch() ).find( ( cmd ) => cmd.name === command ).id;

		if ( !commandId ) { throw new Error( 'Нету такой команды' ); }

		// @ts-ignore
		if ( guild ) { return await bot.client.application.commands.delete( commandId, guild ); }
		// @ts-ignore
		else { return await bot.client.application.commands.delete( commandId ); }
	}

	async sync( guild?: Snowflake | null ): Promise<Array<CommandInteraction>>
	{
		const commands = this.commands
			.filter( ( cmd ) => !cmd.parentOf ) // Если это файл субкоманды то не будет деплоится (Должен деплоится только файл декларации)
			.map( cmd => cmd.info ) // Пихаем только поле info
			.filter( ( cmd ) => !cmd?.local || false ); // Если команда отмечена как локальная то не будет деплоится при синхронизации

		// @ts-ignore
		if ( guild ) { return await bot.client.application.commands.set( commands, guild ); }
		// @ts-ignore
		return await bot.client.application.commands.set( commands );
	}

	getCommand( name: string ): Command | undefined
	{
		return this.commands.find( ( command ) => command?.info.name === name );
	}

	getSubCommand( category: string, name: string ): Command | undefined
	{
		return this.commands.find( c => c.info.name === name && c.parentOf === category );
	}
}

export default CommandsController;