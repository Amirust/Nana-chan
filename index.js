const Bot = require( './dist/client/Client' ).default;
const { Console } = require( './dist/utils/colors' );
const config = require( './config.json' );

( async () =>
{
	/**
     * @param {Array} answers - Массив ответов под заполнение
     * @return {string} - Строка с заполненными ответами
     */
	String.prototype.format = function ( answers )
	{
		if ( !answers ) { return this; }
		return this.replace( /\{([0-9a-zA-Z_]+)\}/g, ( _, item ) =>
		{
			return answers[ item ];
		} );
	};

	if ( ![ 'MONGO', 'NANA_TOKEN' ].every( ( envvar ) => envvar in process.env ) )
	{
		console.error( Console.red( 'ОШИБКА! Не указаны требуемые ENV переменные!' ) );
		process.exit( 1 );
	}

	global.bot = new Bot( {
		token: process.env.NANA_TOKEN,
		mongo: process.env.MONGO,
		config
	} );

	process.on( 'unhandledRejection', console.error );
	process.on( 'uncaughtException', console.error );

	await bot.init();
} )();