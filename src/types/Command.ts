import {
	CommandInteraction,
	CommandInteractionOption,
	SlashCommandAttachmentOption,
	SlashCommandBooleanOption,
	SlashCommandChannelOption,
	SlashCommandIntegerOption,
	SlashCommandMentionableOption,
	SlashCommandNumberOption,
	SlashCommandRoleOption, SlashCommandStringOption, SlashCommandUserOption
} from 'discord.js';
import { Localization } from './Localization';

export type CommandInfo = {
	name: string,
	description?: string,
	options?: Array<any>,
	type?: number,
	local?: boolean,
}

export interface Command {
	info: CommandInfo,
	parentOf?: string,
	type?: number,
	permissions?: Array<string>,
	execute( interaction: CommandInteraction, locale: Localization ): Promise<any>,
	executeAC?( interaction: CommandInteraction, locale: Localization ): Promise<any>;
}