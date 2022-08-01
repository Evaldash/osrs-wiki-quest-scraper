const getQuests = require('./functions');
const fs = require('fs')

getQuests
    .then((quests) => {
        fs.writeFile ("quests.json", JSON.stringify(quests, null, '\t'), function(err) {
            if (err) throw err;
            console.log('complete');
            }
        );
    })