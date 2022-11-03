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

type Rule = {
	regexp: RegExp;
	replace: string;
}

class RenderableMD 
{
	public md: string;
	public rules: Array<Rule>;

	constructor ( { md, rules }: { md: string, rules?: Array<Rule> } )
	{
		this.md = md;
		this.rules = rules || defaultRules;
	}
    
	render ()
	{
		let md = this.md;
		for ( let rule of this.rules )
		{
			md = md.replace( rule.regexp, rule.replace );
		}
        
		return md;
	}

	toJSON()
	{
		return this.md;
	}
}

export default RenderableMD;