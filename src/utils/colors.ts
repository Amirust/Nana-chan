class Console
{
	static black( str: string ): string
	{
		return `\x1b[30m${str}\x1b[0m`;
	}

	static red( str: string ): string
	{
		return `\x1b[31m${str}\x1b[0m`;
	}

	static green( str: string ): string
	{
		return `\x1b[32m${str}\x1b[0m`;
	}

	static yellow( str: string ): string
	{
		return `\x1b[33m${str}\x1b[0m`;
	}

	static blue( str: string ): string
	{
		return `\x1b[34m${str}\x1b[0m`;
	}

	static magenta( str: string ): string
	{
		return `\x1b[35m${str}\x1b[0m`;
	}

	static cyan( str: string ): string
	{
		return `\x1b[36m${str}\x1b[0m`;
	}
    
	static white( str: string ): string
	{
		return `\x1b[37m${str}\x1b[0m`;
	}
}

export { Console };