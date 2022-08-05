const getQuests = require('./functions');
const fs = require('fs')

getQuests
    .then((quests) => {
        fs.writeFile ("./output/quests.json", JSON.stringify(quests, null, '\t'), function(err) {
            if (err) throw err;
            console.log('complete, output saved to output/quests.json');
            }
        );
    })