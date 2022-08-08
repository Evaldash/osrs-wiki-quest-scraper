import { Quest } from './types';
import {getQuests, addQuestSkills, readQuestFile, extractQuestInfo} from './functions';
import * as fs from 'fs';
import * as chalk from 'chalk';


const mockQuest: Quest = {
    miniquest: false,
    members: false,

    name: 'Dragon Slayer I',
    url: 'https://oldschool.runescape.wiki/w/Dragon_Slayer_I',
    shortName: '',
    difficulty: '',
    subquests: [],
    questLength: '',
    requirements: [],
    series: '',
    rewards: [],
    description: '',
    itemsRequired: [],
    itemsRecommended: [],
    enemiesToDefeat: []
}



const main = async () => {
    const quests = await getQuests();
    
    
    //const questsWithSkills = await addQuestSkills(quests);

    fs.writeFile ("./output/quests.json", JSON.stringify(quests, null, '\t'), function(err) {
       if (err) throw err;
        console.log(chalk.green('Complete, result saved to output/quests.json'));
        }
    ); 


    //extractQuestInfo(mockQuest);
}

/*
readQuestFile
    .then((quests) => {
        console.log(quests);
    })
    .catch(err => {
        console.log(err)
    })
*/

main();