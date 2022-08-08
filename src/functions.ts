import * as  path from 'path';
import * as fs from 'fs';
import {load} from 'cheerio';
import axios from 'axios';

import {Quest, QuestReq, QuestReward} from './types';

const skillNames = [
    'Agility', 'Attack', 'Construction', 'Cooking', 'Crafting', 'Defence', 'Farming', 'Firemaking', 'Fishing', 'Fletching', 'Herblore',
    'Hitpoints', 'Hunter', 'Magic', 'Mining', 'Prayer', 'Ranged', 'Runecraft', 'Slayer', 'Smithing', 'Strength', 'Thieving', 'Woodcutting'
]


function omitKeys(obj: any, keys: string[]) {
    var dup = {} as any;
    for (const key in obj) {
        if (keys.indexOf(key) == -1) {
            dup[key] = obj[key];
        }
    }
    return dup;
}

function toPascalCase(string: string) {
    return `${string}`
      .toLowerCase()
      .replace(new RegExp(/[-_]+/, 'g'), ' ')
      .replace(new RegExp(/[^\w\s]/, 'g'), '')
      .replace(
        new RegExp(/\s+(.)(\w*)/, 'g'),
        ($1, $2, $3) => `${$2.toUpperCase() + $3}`
      )
      .replace(new RegExp(/\w/), s => s.toUpperCase());
  }


const getQuests = () => new Promise<Quest[]>(function (resolve, reject){
    const questListURL = 'https://oldschool.runescape.wiki/w/Quests/List';
    const questList: Quest[] = [];

    try {
        axios(questListURL) // get all quests
            .then(response => {
                const html = response.data.replace(/(\r\n|\n|\r)/gm, "");
                let $ = load(html);

                $(".wikitable", html).each(function() {
                    let nameColumnIndex = -1;

                    $(this) // find name column number
                        .find("tbody")
                        .find("tr")
                        .first()
                        .find("th")
                        .each((i, el) => {
                            if ($(el).text() === 'Name') {
                                nameColumnIndex = i;
                                return false;
                            }
                        })

                        if (nameColumnIndex === -1) return; // not a quest table
                        
                        $(this)
                            .find("tbody")
                            .find("tr")
                            .each(function() {
                                const questName = $(this).find(`td:nth-child(${nameColumnIndex+1})`).find("a").text();
                                const questLink = $(this).find(`td:nth-child(${nameColumnIndex+1})`).find("a").attr("href");
                                if (questName != ''){
                                    const quest = {} as Quest;
                                    quest.name = questName;
                                    quest.shortName = toPascalCase(questName);
                                    quest.url = `https://oldschool.runescape.wiki${questLink}`;

                                    questList.push(quest);
                                }
                            })
                        
                })
                resolve(questList);
            })
    } catch(err){}
})

const addQuestSkills = (questList: Quest[]) => new Promise<Quest[]>(function (resolve, reject){
    const questReqURL = 'https://oldschool.runescape.wiki/w/Quests/Skill_requirements';

    axios(questReqURL) // get the quest requirements
    .then(response => {
        const html = response.data;
        const $ = load(html);

        skillNames.forEach((skillName) => {

            $(`#${skillName}`, html) // find the title
                .parent()
                .next("div")
                .find("ul")
                .find("li")
                .each(function(){
                    const htmlLine = $(this).html() as any;

                    const questReq = {} as QuestReq;
                    questReq.skill = skillName;
                    questReq.boostable = htmlLine.includes("*");
                    questReq.level = htmlLine.substring(0, htmlLine.indexOf(' '));

                    let partialUrl = '';
                    const questLink = $(this).find("a").attr("href") as any;
                    
                    switch (questLink){
                        case '/w/Forgettable_Tale_of_a_Drunken_Dwarf' : partialUrl = '/w/Forgettable_Tale...';  break;
                        case '/w/Slug_Menace':                          partialUrl = '/w/The_Slug_Menace';      break;
                        case '/w/Tears_of_Guthix_(quest)':              partialUrl = '/w/Tears_of_Guthix';      break;
                        case '/w/Underground_Pass_(quest)':             partialUrl = '/w/Underground_Pass';     break;
                        default:                                        partialUrl = questLink;                 break;
                    }

                    questReq.url = `https://oldschool.runescape.wiki${partialUrl}`;

                    const questIndex = questList.findIndex((quest: Quest) => quest.url === questReq.url);
                    if (questIndex === -1) console.warn(`Warning: couldnt find a quest for requirement with link: ${questReq.url}`);
                    else {
                        if (questList[questIndex].requirements == null) questList[questIndex].requirements = [];
                        questList[questIndex].requirements.push(omitKeys(questReq, ['url']));
                    }
            })
        })

        resolve(questList);
    })
})

const extractQuestInfo = (quest: Quest) => new Promise<Quest|null>(function (resolve, reject){
    const questURL = quest.url;

    axios(questURL) // get the quest info
        .then(response => {
            const html = response.data;
            const $ = load(html);

            $(".questdetails", html)
                .find("tbody")
                .find("tr")
                .each(function(){
                    const detailType = $(this).find("th").html();
                    const detailsHtml = $(this).find(".questdetails-info").html() as any;

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

                resolve(quest);
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

export {getQuests, readQuestFile, addQuestSkills, extractQuestInfo};