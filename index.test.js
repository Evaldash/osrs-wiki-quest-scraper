const getQuests = require('./functions');

let sampleQuestJson = `
	{
		"name": "A Kingdom Divided",
		"uri": "https://oldschool.runescape.wiki/w/A_Kingdom_Divided",
		"partialUri": "/w/A_Kingdom_Divided",
		"reqs": [
			{
				"skill": "Agility",
				"level": "54",
				"boostable": false
			},
			{
				"skill": "Crafting",
				"level": "38",
				"boostable": false
			},
			{
				"skill": "Herblore",
				"level": "50",
				"boostable": false
			},
			{
				"skill": "Magic",
				"level": "35",
				"boostable": false
			},
			{
				"skill": "Mining",
				"level": "42",
				"boostable": false
			},
			{
				"skill": "Thieving",
				"level": "52",
				"boostable": false
			},
			{
				"skill": "Woodcutting",
				"level": "52",
				"boostable": false
			}
		]
	}
`;

const sampleQuest = JSON.parse(sampleQuestJson);

test('Checks if A kingdom divided quest is parsed properly', () => {
    return getQuests.then(quests => {
        expect(quests).toContainEqual(sampleQuest);
    })
})