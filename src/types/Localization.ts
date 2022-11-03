type Localization = {
	description: string,
	errors: { [name: string]: string },
	commands: {
		[commandName: string]: any
	}
}

export { Localization };