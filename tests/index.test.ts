import { boneVoyage, aKingdomDivided, dreamMentor } from './testQuests';
import {addSkillRequirements, getBaseQuestList} from '../src/functions/quest';
import { Quest } from '../src/types';


describe("Main tests", () => {
	let quests = {} as Quest[];

	beforeAll(async () => {
		let baseQuests = await getBaseQuestList();
		quests = await addSkillRequirements(baseQuests);
	})
	
	test('Basic quest (Bone Voyage) is parsed properly', () => {
		expect(quests).toContainEqual(boneVoyage);
	})

	test('Quest with a lot of skill requirements (A kingdom Divided) is parsed properly', () => {
		expect(quests).toContainEqual(aKingdomDivided);
	})
	test('Edge quest (Dream Mentor) is parsed properly', () => {
		expect(quests).toContainEqual(dreamMentor);
	})

	test('Fetched quest count is at least 180', () => {
		expect(quests.length).toBeGreaterThanOrEqual(180);
	})
})
