const axios = require('axios');
const cheerio = require('cheerio');

const fs = require('fs');
const path = require('path');

const {Quest, QuestReq, QuestReward} = require('./classes.js');

const skillNames = [
    'Agility', 'Attack', 'Construction', 'Cooking', 'Crafting', 'Defence', 'Farming', 'Firemaking', 'Fishing', 'Fletching', 'Herblore',
    'Hitpoints', 'Hunter', 'Magic', 'Mining', 'Prayer', 'Ranged', 'Runecraft', 'Slayer', 'Smithing', 'Strength', 'Thieving', 'Woodcutting'
]


function omitKeys(obj, keys){
    var dup = {};
    for (var key in obj) {
        if (keys.indexOf(key) == -1) {
            dup[key] = obj[key];
        }
    }
    return dup;
}


const getQuests = new Promise(function (resolve, reject){
    const questListURL = 'https://oldschool.runescape.wiki/w/Quests/List';
    const questList = [];

    try {
        axios(questListURL) // get all quests
            .then(response => {
                let html = response.data;
                let $ = cheerio.load(html);

                $(".wikitable", html).each(function() {  
                        $(this).find("tbody").find("tr").each(function() {
                            const questName = $(this).find("td:nth-child(2)").find("a").text();
                            const questLink = $(this).find("td:nth-child(2)").find("a").attr("href");
                            if (questName != ''){
                                const quest = new Quest();
                                quest.name = questName;
                                quest.url = `https://oldschool.runescape.wiki${questLink}`;

                                questList.push(quest);
                            }
                        })
                    
                })

                resolve(questList);
            })
    } catch(err){}
})

const addQuestSkills = (questList) => new Promise(function (resolve, reject){
    const questReqURL = 'https://oldschool.runescape.wiki/w/Quests/Skill_requirements';

    axios(questReqURL) // get the quest requirements
    .then(response => {
        html = response.data;
        $ = cheerio.load(html);

        skillNames.forEach((skillName) => {

            $(`#${skillName}`, html) // find the title
                .parent()
                .next("div")
                .find("ul")
                .find("li")
                .each(function(){
                    const htmlLine = $(this).html();

                    const questReq = new QuestReq();
                    questReq.skill = skillName;
                    questReq.boostable = htmlLine.includes("*");
                    questReq.level = htmlLine.substring(0, htmlLine.indexOf(' '));

                    let partialUrl = '';
                    const questLink = $(this).find("a").attr("href");
                    
                    switch (questLink){
                        case '/w/Forgettable_Tale_of_a_Drunken_Dwarf' : partialUrl = '/w/Forgettable_Tale...';  break;
                        case '/w/Slug_Menace':                          partialUrl = '/w/The_Slug_Menace';      break;
                        case '/w/Tears_of_Guthix_(quest)':              partialUrl = '/w/Tears_of_Guthix';      break;
                        case '/w/Underground_Pass_(quest)':             partialUrl = '/w/Underground_Pass';     break;
                        default:                                        partialUrl = questLink;                 break;
                    }

                    questReq.url = `https://oldschool.runescape.wiki${partialUrl}`;

                    const questIndex = questList.findIndex(quest => quest.url === questReq.url);
                    if (questIndex === -1) console.warn(`Warning: couldnt find a quest for requirement with link: ${questReq.url}`);
                    else questList[questIndex].requirements.push(omitKeys(questReq, ['url']));
            })
        })

        resolve(questList);
    })
})

const extractQuestInfo = (quest) => new Promise(function (resolve, reject){
    const questURL = quest.url;

    axios(questURL) // get the quest info
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            $(".questdetails", html)
                .find("tbody")
                .find("tr")
                .each(function(){
                    const detailType = $(this).find("th").html();
                    const detailsHtml = $(this).find(".questdetails-info").html();

                    switch (detailType){
                        case 'Official difficulty': quest.difficulty = detailsHtml; break;
                        case 'Description': quest.description = detailsHtml;        break;
                        case 'Official length': quest.questLength = detailsHtml;    break;
                        case 'Requirements': /* TODO */ {};                         break;
                        case 'Items required': /* TODO */ {};                       break;
                        case 'Recommended': /* TODO */ {};                          break;
                        case 'Enemies to defeat': /* TODO */ {};                    break;
                        
                        case 'Ironman concerns':case 'Start point':  {};            break; // ignore, not needed
                        
                        default: {console.warn(`Warning: Unknown quest detail type: ${detailType}`)}
                    }
                })

                console.log(quest);

               // console.log(html);5

                resolve(true);
        })
})


const readQuestFile = new Promise(function (resolve, reject){
    try{
        const filePath = path.join(__dirname, '../output/quests-TODO.json');
        const quests = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        resolve(quests);
    }
    catch(err) {
        reject(err)
    }
})

module.exports = {getQuests, readQuestFile, addQuestSkills, extractQuestInfo};