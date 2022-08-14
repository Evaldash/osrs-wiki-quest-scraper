import {
    getBaseQuestList
    ,readQuestFile
    ,extractQuestInfo
    ,findMissingQuests,
    addSkillRequirements,
    addSkillRewards
} from './functions/quest';
import * as fs from 'fs';
import * as chalk from 'chalk';
import { Quest } from './types';


const main = async () => {
    const wikiQuestList = await getBaseQuestList();
    const questsWithSkillReqs = await addSkillRequirements(wikiQuestList);
    //const questsWithSkillRewards = await addSkillRewards(questsWithSkillReqs);

    fs.writeFile ("./output/quests.json", JSON.stringify(questsWithSkillReqs, null, '\t'), function(err) {
        if (err) throw err;
         console.log(chalk.green('Complete, result saved to output/quests.json'));
         }
     );
}

const singleQuestExtraction = async () => {
    const sampleQuestJson =
    `{
        "name": "Dragon Slayer I",
        "shortName": "DragonSlayerI",
        "url": "https://oldschool.runescape.wiki/w/Dragon_Slayer_I",
        "series": "Dragonkin",
        "releaseOrder": "17",
        "members": false,
        "miniquest": false
    }`;

    const sampleQuest = JSON.parse(sampleQuestJson);
    const updatedQuest = await extractQuestInfo(sampleQuest);

    fs.writeFile ("./output/mock_quest_result.json", JSON.stringify(updatedQuest, null, '\t'), function(err) {
        if (err) throw err;
         console.log(chalk.green('Complete, result saved to output/mock_quest_result.json'));
         }
     );
}

const localQuestListCheck = async () => {
    const localQuestList = await readQuestFile();
    const wikiQuestList = await getBaseQuestList();

    if (localQuestList == null) console.error(chalk.red("Error: couldnt get any data from quests-TODO.json"));
    else{
        const missingQuests = findMissingQuests(wikiQuestList, localQuestList);

        if(missingQuests.length > 0){
            console.log(chalk.yellow('----------------------------------------------------'));
            console.log(chalk.yellow(`${missingQuests.length} quests seem to be missing from quests-TODO.json:`));
            missingQuests.forEach( (missingQuest: Quest, i) => {console.log(chalk.yellow(`${i+1}. ${missingQuest.name}`))} )
            console.log(chalk.yellow('----------------------------------------------------'));
        }
        else console.log(chalk.green('All quests are present, no need to DDOS the wiki'));
    }
}

main();