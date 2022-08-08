import {getQuests, addQuestSkills} from '../src/functions';

let sampleQuestJson = `
{
	"name": "Lost City",
	"url": "https://oldschool.runescape.wiki/w/Lost_City",
	"requirements": [
		{
			"skill": "Crafting",
			"boostable": true,
			"level": "31"
		},
		{
			"skill": "Woodcutting",
			"boostable": true,
			"level": "36"
		}
	]
}
`;

const sampleQuest = JSON.parse(sampleQuestJson);

test('Checks if Lost City quest is parsed properly', async () => {
		const quests = await getQuests();
		const questsWithSkills = await addQuestSkills(quests);

		expect(questsWithSkills).toContainEqual(sampleQuest);
})