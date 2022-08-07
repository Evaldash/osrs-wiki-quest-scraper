const {getQuests, addQuestSkills, readQuestFile, extractQuestInfo} = require('./functions');
const fs = require('fs')

const mockQuest = {
        miniquest: false,
        members: false,
        
        name: 'Dragon Slayer I',
        url: 'https://oldschool.runescape.wiki/w/Dragon_Slayer_I',

        requirements: [],
        
        difficulty: undefined,
        subquests: undefined,
        questLength: undefined,
        
        series: undefined,
        rewards: [],
        description: undefined,
        shortName: undefined,
    
        itemsRequired: undefined,
        itemsRecommended: undefined,
        enemiesToDefeat: undefined
    }



const main = async () => {
    const quests = await getQuests();
    const questsWithSkills = await addQuestSkills(quests);

    fs.writeFile ("./output/quests.json", JSON.stringify(questsWithSkills, null, '\t'), function(err) {
        if (err) throw err;
        console.log('complete, output saved to output/quests.json');
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