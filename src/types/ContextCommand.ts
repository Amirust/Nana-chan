import {
	CommandInteraction,
	CommandInteractionOption,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction
} from 'discord.js';
import { Localization } from './Localization';

type CommandInfo = {
	name: string,
	type: number
}

export interface ContextCommand {
	info: CommandInfo,
	execute( interaction: MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction, locale: Localization ): Promise<any>
}