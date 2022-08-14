import axios from "axios";
import { load } from "cheerio";
import { omitKeys } from "./functions";
import { Quest, QuestReq } from "./types";

const skillNames = [
    'Agility', 'Attack', 'Construction', 'Cooking', 'Crafting', 'Defence', 'Farming', 'Firemaking', 'Fishing', 'Fletching', 'Herblore',
    'Hitpoints', 'Hunter', 'Magic', 'Mining', 'Prayer', 'Ranged', 'Runecraft', 'Slayer', 'Smithing', 'Strength', 'Thieving', 'Woodcutting'
]


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