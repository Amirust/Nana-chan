class Console
{
	static black( str )
	{
		return `\x1b[30m${str}\x1b[0m`;
	}

	static red( str )
	{
		return `\x1b[31m${str}\x1b[0m`;
	}

	static green( str )
	{
		return `\x1b[32m${str}\x1b[0m`;
	}

	static yellow( str )
	{
		return `\x1b[33m${str}\x1b[0m`;
	}

	static blue( str )
	{
		return `\x1b[34m${str}\x1b[0m`;
	}

	static magenta( str )
	{
		return `\x1b[35m${str}\x1b[0m`;
	}

	static cyan( str )
	{
		return `\x1b[36m${str}\x1b[0m`;
	}
    
	static white( str )
	{
		return `\x1b[37m${str}\x1b[0m`;
	}
}

module.exports = {
	Console
};