import {Collection, ColorResolvable, EmbedFooterData, Snowflake} from 'discord.js';

type BotConfig = {
	owners: Array<Snowflake>,
	alphaTesters: Array<Snowflake>,
	footer: EmbedFooterData,
	colors: {
		primary: ColorResolvable,
		warn: ColorResolvable,
		danger: ColorResolvable,
		success: ColorResolvable,
		embedBorder: ColorResolvable
	},
	alphaId: Snowflake,
	version: string
}

type RequestsCooldown = {
	createdAt: EpochTimeStamp,
	target?: Snowflake,
	requester?: string
}

type BotStore = {
	activeMarriesRequests: Collection<string, RequestsCooldown>,
	activeDivorcesRequests: Collection<string, RequestsCooldown>,
	activePartyInvites: Collection<string, RequestsCooldown>
}

export { BotConfig, BotStore, RequestsCooldown };