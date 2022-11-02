import { CommandInteraction, CommandInteractionOption } from 'discord.js';
import { Localization } from './Localization';

type CommandInfo = {
	name: string,
	description?: string,
	options?: Array<CommandInteractionOption>
}

export interface Command {
	info: CommandInfo,
	execute( interaction: CommandInteraction, locale?: Localization ): Promise<void>,
	executeAC( interaction: CommandInteraction, locale?: Localization ): Promise<void>;
}