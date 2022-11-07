import Bot from '../client/Client';
import { MessageChannelComponentCollector } from 'discord.js';

declare global {
	interface String {
		format( answers: Array<string> ): string;
	}
	let bot: Bot;
}

declare module 'discord.js' {
	interface ButtonBuilder {
		setAction( fn: Function, collector: MessageChannelComponentCollector ): this;
	}
	interface ModalBuilder {
		setAction( fn: Function ): this;
	}
	interface SelectMenuBuilder {
		setAction( fn: Function, collector: MessageChannelComponentCollector ): this;
	}
}