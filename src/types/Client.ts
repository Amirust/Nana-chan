import { Collection, EmbedFooterData, Snowflake } from 'discord.js';

type BotConfig = {
	owners: Array<Snowflake>,
	alphaTesters: Array<Snowflake>,
	footer: EmbedFooterData,
	colors: {
		primary: string,
		warn: string,
		danger: string,
		success: string,
		embedBorder: string
	},
	alphaId: Snowflake,
	version: string
}

type RequestsCooldown = {
	createdAt: Date,
	target?: Snowflake,
	requester?: string
}

type BotStore = {
	activeMarriesRequests: Collection<string, RequestsCooldown>,
	activeDivorcesRequests: Collection<string, RequestsCooldown>,
	activePartyInvites: Collection<string, RequestsCooldown>
}

export { BotConfig, BotStore, RequestsCooldown };