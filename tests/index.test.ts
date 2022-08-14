import {getBaseQuestList} from '../src/functions';
import { Quest } from '../src/types';

let sampleFutureQuest = `
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


let sampleQuestJson = 
`	{
	"name": "Bone Voyage",
	"shortName": "BoneVoyage",
	"url": "https://oldschool.runescape.wiki/w/Bone_Voyage",
	"series": "",
	"releaseOrder": "132",
	"members": true,
	"miniquest": false
}`


describe("Main tests", () => {
	const sampleQuest = JSON.parse(sampleQuestJson);
	let quests = {} as Quest[];

	beforeAll(async () => {
		quests = await getBaseQuestList();
	})
	
	test('Bone Voyage quest is parsed properly', () => {
		expect(quests).toContainEqual(sampleQuest);
	})

	test('Fetched quest count is at least 180', () => {
		expect(quests.length).toBeGreaterThanOrEqual(180);
	})
})
