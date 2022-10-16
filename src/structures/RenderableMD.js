const defaultRules = [
	{
		regexp: /^# (.*$)/gim,
		replace: '**`$1`**'
	},
	{
		regexp: /^## (.*$)/gim,
		replace: '**$1**'
	},
	{
		regexp: /^### (.*$)/gim,
		replace: '`$1`'
	},
	{
		regexp: /\*\*(.*)\*\*/gim,
		replace: '**$1**'
	},
	{
		regexp: /\*(.*)\*/gim,
		replace: '*$1*'
	},
	{
		regexp: /!\[(.*?)\]\((.*?)\)/gim,
		replace: ''
	},
	{
		regexp: /^(\*) /gim,
		replace: '`::` '
	},
	{
		regexp: /\[(.*?)\]\((.*?)\)/gim,
		replace: '[$2]($1)'
	}
];

class RenderableMD 
{
	constructor ({ md, rules })
	{
		this.md = md;
		this.rules = rules || defaultRules; // Array<{ regexp, replace }>
	}
    
	render ()
	{
		let md = this.md;
		for (let rule of this.rules)
		{
			md = md.replace(rule.regexp, rule.replace);
		}
        
		return md;
	}

	toJSON()
	{
		return this.md;
	}
}

module.exports = RenderableMD;  