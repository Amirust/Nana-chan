import { CommandInfo } from './Command';

export interface CommandsDeclaration {
	info: {
		name: string,
		description: string,
		options?: Array<CommandInfo>
	}
}