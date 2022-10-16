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
		this.description = data?.description || null;
		this.privacy = new Privacy(data?.privacy || 0);
		this.icon = data?.icon || null;
		this.course = data?.course ? new RenderableMD(data.course) : null;
		this.charter = data?.charter ? new RenderableMD(data.charter) : null;
	}

	toJSON()
	{
		return {
			description: this.description,
			privacy: this.privacy.bitfield,
			icon: this.icon,
			course: this.course ? this.course.toJSON() : null,
			charter: this.charter ? this.charter.toJSON() : null
		};
	}
}

module.exports = PartyMeta;