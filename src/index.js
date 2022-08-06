const {getQuests, addQuestSkills, readQuestFile} = require('./functions');
const fs = require('fs')


const main = async () => {
    const quests = await getQuests;
    const questsWithSkills = await addQuestSkills(quests);

    fs.writeFile ("./output/quests.json", JSON.stringify(questsWithSkills, null, '\t'), function(err) {
        if (err) throw err;
        console.log('complete, output saved to output/quests.json');
        }
    );
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