import {
    getBaseQuestList
    ,readQuestFile
    ,extractQuestInfo
    ,findMissingQuests
} from './functions/quest';
import * as fs from 'fs';
import * as chalk from 'chalk';
import { Quest } from './types';


const main = async () => {
    const wikiQuestList = await getBaseQuestList();
    const localQuestList = await readQuestFile();

    fs.writeFile ("./output/quests.json", JSON.stringify(wikiQuestList, null, '\t'), function(err) {
        if (err) throw err;
         console.log(chalk.green('Complete, result saved to output/quests.json'));
         }
     );

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