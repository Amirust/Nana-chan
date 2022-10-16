const RenderableMD = require('./RenderableMD');
const Flags = require('./Flags');

class Privacy extends Flags 
{
	static FLAGS = {
		Owner: (1 << 0),
		Members: (2 << 0)
	};
}

class PartyMeta 
{
	constructor(data)
	{
		this.description = data?.description ? new RenderableMD({ md: data.description }) : null;
		this.privacy = new Privacy(data?.privacy || 0);
		this.icon = data?.icon || null;
		this.course = data?.course || null;
	}

	toJSON()
	{
		return {
			description: this.description,
			privacy: this.privacy.bitfield,
			icon: this.icon,
			course: this.course
		};
	}
}

module.exports = PartyMeta;