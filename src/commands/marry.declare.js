// ФАЙЛ ДЕКЛАРАЦИИ ПОД-КОМАНД
// СВАДЬБЫ

module.exports = {
	info: {
		name: 'marry',
		description: 'Свадьбы',
		options: [{
			name: 'invite',
			description: 'Сделать предложение кому-либо',
			type: 1,
			options: [{
				name: 'user',
				description: 'Пользователь',
				required: true,
				type: 6
			}]
		}, {
			name: 'divorce',
			description: 'Развестись',
			type: 1
		}, {
			name: 'list',
			description: 'Получить список всех браков на сервере',
			type: 1
		}]
	}
};