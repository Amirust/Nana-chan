import {
	AutocompleteInteraction,
	CommandInteraction
} from 'discord.js';
import { Localization } from './Localization';

export type CommandInfo = {
	name: string, // Название команды
	description?: string, // Описание команды
	options?: Array<any>, // Опции команды
	type?: number, // Тип команды
	local?: boolean, // Локальная команда
}

export interface Command {
	info: CommandInfo,
	parentOf?: string,
	type?: number,
	permissions?: Array<string>,
	execute( interaction: CommandInteraction, locale: Localization ): Promise<any>,
	executeAC?( interaction: AutocompleteInteraction, locale: Localization ): Promise<any>;
}