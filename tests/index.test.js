const {getQuests, addQuestSkills} = require('../src/functions');

let sampleQuestJson = `
{
	"name": "Lost City",
	"url": "https://oldschool.runescape.wiki/w/Lost_City",
	"requirements": [
		{
			"skill": "Crafting",
			"level": "31",
			"boostable": true
		},
		{
			"skill": "Woodcutting",
			"level": "36",
			"boostable": true
		}
	],
	"rewards": []
}
`;

const sampleQuest = JSON.parse(sampleQuestJson);

test('Checks if Lost City quest is parsed properly', async () => {
		const quests = await getQuests;
		const questsWithSkills = await addQuestSkills(quests);

		expect(questsWithSkills).toContainEqual(sampleQuest);
})