import ruPermissions from '../assets/ru_permissions.json';
import { Localization } from '../types/Localization';
import {
	Snowflake,
	CommandInteraction,
	Collection,
	ApplicationCommand,
	ApplicationCommandDataResolvable, PermissionsBitField
} from 'discord.js';
import { Command } from '../types/Command';
import { CommandInfo } from '../types/Command';

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
		if ( !command ) return;

		// Альфа тест скам
		// if ( !bot.config.alphaTesters.includes( interaction.user.id ) ) { return interaction.reply({ content: 'Эта команда находится в альфа-тестировании и доступна только альфа-тестерам', ephemeral: true }); }

		// Скам если бот в альфе
		if ( bot.client.user?.id === bot.config.alphaId && !bot.config.owners.includes( interaction.user.id ) ) { return interaction.reply( { content: `Видишь себя в этом списке?\n${ ( await Promise.all( bot.config.owners.map( async id => await bot.client.users.fetch( id ) ) ).then( res => res.map( u => u.tag ) ) ).join( ', ' ) }\nИ я нет, по этому катись нахуй.`, ephemeral: true } ); }

		// Авто-комлпит
		if ( interaction?.isAutocomplete() )
		{
			// @ts-ignore
			return command.executeAC( interaction, localizator( locale ) );
		}

		// Контекстные команды 
		if ( interaction?.isContextMenuCommand() )
		{
			return command.execute( interaction, localizator( locale ) );
		}

		// Обычные команды
		if ( interaction?.isChatInputCommand() )
		{
			if ( command.permissions?.length || 0 > 0 ) // Проверка прав
			{
				const memberPermissions = interaction.member?.permissions as PermissionsBitField;
				if ( !memberPermissions.toArray().every( ( p ) => command.permissions?.includes( p ) ) && !memberPermissions.has( 'Administrator' ) && !( interaction.guild?.ownerId === interaction.member?.user.id ) )
				{
					const requiredPerms: Array<string> = [];

					command.permissions?.map( ( prop: string ) =>
						// @ts-ignore
						requiredPerms.push( ruPermissions[ prop ] )
					);
					return interaction.reply( { content: `<:firewall:1028383375444168815> У вас нет на это требуемых прав!\nТребуемые права: ${requiredPerms.map( ( prop ) =>
					{
						return `\`${prop}\``;
					} ).join( ', ' )} // Вам не хватает: ${requiredPerms.filter( ( prop: any ) => !memberPermissions.toArray().includes( prop ) ).map( ( prop ) =>
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
					if ( subcommand ) { return subcommand.execute( interaction, localizator( locale ) ); }
				}

				return command?.execute( interaction, localizator( locale ) );
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

	async create( command: string, guild?: Snowflake ): Promise<ApplicationCommand | undefined>
	{
		const cmd = this.getCommand( command );
		if ( !cmd ) {  throw new Error( 'Нету такой команды' ); }

		if ( cmd.info.type || 0 > 1 ) { delete cmd.info.description; }

		if ( guild ) { return bot.client.application?.commands.create( cmd.info as ApplicationCommandDataResolvable ); }
		else { return bot.client.application?.commands.create( cmd.info as ApplicationCommandDataResolvable ); }
	}

	async createCold( info: CommandInfo, guild?: Snowflake ): Promise<ApplicationCommand | undefined>
	{
		if ( guild ) { return bot.client.application?.commands.create( info as ApplicationCommandDataResolvable ); }
		else { return bot.client.application?.commands.create( info as ApplicationCommandDataResolvable ); }
	}

	async remove( command: Snowflake, guild?: Snowflake ): Promise<ApplicationCommand | null | undefined>
	{
		// @ts-ignore
		const commandId = /^[0-9]{17,19}$/gm.test( command ) ? command : ( await bot.client.application?.commands.fetch() ).find( ( cmd ) => cmd.name === command ).id;

		if ( !commandId ) { throw new Error( 'Нету такой команды' ); }

		if ( guild ) { return bot.client.application?.commands.delete( commandId, guild ); }
		else { return bot.client.application?.commands.delete( commandId ); }
	}

	async sync( guild?: Snowflake | null ): Promise<Collection<string, ApplicationCommand> | undefined>
	{
		const commands = this.commands
			.filter( ( cmd ) => !cmd.parentOf ) // Если это файл субкоманды то не будет деплоится (Должен деплоится только файл декларации)
			.map( cmd => cmd.info ) // Пихаем только поле info
			.filter( ( cmd ) => !cmd?.local || false ); // Если команда отмечена как локальная то не будет деплоится при синхронизации

		if ( guild ) { return bot.client.application?.commands.set( commands as ApplicationCommandDataResolvable[], guild ); }
		return bot.client.application?.commands.set( commands as ApplicationCommandDataResolvable[] );
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