// ФАЙЛ ДЕКЛАРАЦИИ ПОД-КОМАНД
// ПАРТИИ

module.exports = {
	info: {
		name: 'party',
		description: 'Партии',
		options: [{
			name: 'create',
			description: 'Создать партию',
			type: 1,
			options: [{
				name: 'name',
				description: 'Имя (Пишите короткие по типу ЕД, ЛДПР, КПРФ и т.д. Полные укажите в описании)',
				required: true,
				type: 3
			}]
		}, {
			name: 'modify',
			description: 'Модифицировать партию',
			type: 1
		}, {
			name: 'list',
			description: 'Список партий',
			type: 1
		},{
			name: 'invite',
			description: 'Пригласить в партию',
			type: 1,
			options: [{
				name: 'user',
				description: 'Пользователь',
				required: true,
				type: 6
			}]
		}, {
			name: 'kick',
			description: 'Выгнать из партии',
			type: 1,
			options: [{
				name: 'user',
				description: 'Пользователь',
				required: true,
				type: 6
			}]
		}, {
            name: 'user',
            description: 'Получить партию юзера',
            type: 1,
            options: [{
                name: 'user',
                description: 'Пользователь',
                required: false,
                type: 6
            }]
        }]
	}
};
