import { SkillReq } from './../types';
import { QUEST_REQ_LIST_URL, SKILLS_ARRAY, QUEST_REW_LIST_URL } from './../constants';
import { QUEST_LIST_TABLE, QUEST_LIST_URL, WIKI_TABLE_TYPES, WIKI_BASE_URL, QUEST_DETAILS_TABLE } from '../constants';
import * as  path from 'path';
import * as fs from 'fs';
import {load} from 'cheerio';
import axios from 'axios';

import { Quest, QuestReward, ItemReq } from '../types';
import * as chalk from  'chalk';
import { omitKeys, toPascalCase, verboseDebug } from './generic';

const getBaseQuestList = () => new Promise<Quest[]>(function (resolve, reject){
    const qList: Quest[] = [];

    try {
        axios(QUEST_LIST_URL) // get all quests
            .then(response => {
                const html = response.data.replace(/(\r\n|\n|\r)/gm, "");
                let $ = load(html);

  
                $(".wikitable", html).each(function() {
                    let questNumberColIndex = -1, nameColIndex = -1, seriesColIndex = -1, relDateColIndex = -1, qPointsRewardColIndex = -1;
                    let wikitable = this;

                    const sectionTitle = $(wikitable).prevAll("h2").first().find("span").attr("id");

                    const isMembersTable   = (sectionTitle === WIKI_TABLE_TYPES.QUEST_MEMBERS);
                    const isF2pTable       = (sectionTitle === WIKI_TABLE_TYPES.QUEST_F2P);
                    const isMiniquestTable = (sectionTitle === WIKI_TABLE_TYPES.QUEST_MINIQUEST);

                    // find column places
                    $(wikitable)  
                        .find("tbody")
                        .find("tr")
                        .first()
                        .find("th")
                        .each((i, el) => {
                            switch($(el).text()) {
                                case QUEST_LIST_TABLE.QUEST_NO:     questNumberColIndex = i;   break;
                                case QUEST_LIST_TABLE.NAME:         nameColIndex = i;          break;
                                case QUEST_LIST_TABLE.SERIES:       seriesColIndex = i;        break;

                               // case QUEST_LIST_TABLE.QUESTPOINTS:    qPointsRewardColIndex = i; break; //FIXME: handle special column
                                //case QUEST_LIST_TABLE.RELEASE_DATE: relDateColIndex = i;       break; // FIXME: multiple a elements inside
                            
                                case QUEST_LIST_TABLE.DIFFICULTY: case QUEST_LIST_TABLE.LENGTH: {} break;
                            }
                        })

                    if(nameColIndex === -1){
                        verboseDebug(chalk.yellow("Didn't find a name column, skipping table: ", $(wikitable).text()));
                        return; // not a quest table
                    } 
                        
                        // extract info from the tables
                        $(wikitable)
                            .find("tbody")
                            .find("tr")
                            .each(function() {
                                if ($(this).find("th").length != 0){
                                    verboseDebug(chalk.yellow("Found a th element, skipping tr with value: ", $(this).find("th").first().text()))
                                    return;
                                }

                                const qReleaseOrder = $(this).find("td").eq(questNumberColIndex).text();
                                const qName = $(this).find("td").eq(nameColIndex).find("a").text();
                                const qSeries = $(this).find("td").eq(seriesColIndex).find("a").text();

                                const questLink = $(this).find(`td:nth-child(${nameColIndex+1})`).find("a").attr("href");
                                if (qName != ''){
                                    const quest = {} as Quest;

                                    quest.name = qName;
                                    quest.shortName = toPascalCase(qName);
                                    quest.url = WIKI_BASE_URL + questLink;
                                    quest.series = qSeries;

                                    if (!(isMembersTable || isMiniquestTable) && !isF2pTable) console.warn(chalk.yellow("Warning: unknown quest table, assuming quest is members"));
                                    
                                    if (!isMiniquestTable) quest.releaseOrder = qReleaseOrder;
                                    
                                    quest.members = (isMembersTable || isMiniquestTable) ? true : isF2pTable ? false : true;
                                    quest.miniquest = isMiniquestTable;

                                    qList.push(quest);
                                }
                                else verboseDebug(chalk.red("No quest found for element ", $(this).html()))
                            })
                  
                })

                resolve(qList);
            })
    } catch(err){}
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
                        case QUEST_DETAILS_TABLE.DIFFICULTY:     quest.difficulty = detailsHtml;                         break;
                        case QUEST_DETAILS_TABLE.DESCRIPTION:    quest.description = detailsHtml;                        break;
                        case QUEST_DETAILS_TABLE.QUEST_LENGTH:   quest.questLength = detailsHtml;                        break;
                       // case QUEST_DETAILS_TABLE.REQUIREMENTS:   quest.requirements = extractGeneralReq(detailsHtml);    break;
                        case QUEST_DETAILS_TABLE.ITEMS_REQUIRED: quest.itemsRequired = extractItemsReq(detailsHtml);     break;
                        case QUEST_DETAILS_TABLE.RECOMMENDED: /* TODO */ {};                                             break;
                        case QUEST_DETAILS_TABLE.ENEMIES: /* TODO */ {};                                                 break;
                        
                        case QUEST_DETAILS_TABLE.IRON_CONCERNS: case QUEST_DETAILS_TABLE.START_POINT:  {};               break; // ignore, not needed
                        
                        default: {console.warn(chalk.yellow(`Warning: Unknown quest detail type: ${detailType}`))}
                    }
                })
                resolve(quest);
        })
})
// TODO
const extractItemsReq = (html: string) => {
    const $ = load(html);
    const itemList = [] as ItemReq[];

    $(".lighttable")
        .find("ul")
        .find("li")
        .each(function(){
            const item = {} as ItemReq;
            item.name = $(this).text();
            itemList.push(item);
        })
    

    return itemList;
}

// TODO
const extractGeneralReq = (html: string) => {
    return [];
}


const readQuestFile = () => new Promise<Quest[]|null>(function (resolve, reject){
    try{
        const filePath = path.join(__dirname, '../../output/quests-TODO.json');
        const quests = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Quest[];
        resolve(quests);
    }
    catch(err) {
        reject(err)
    }
})

const findMissingQuests = (wikiQuests: Quest[], localQuests: Quest[]) => {
    const missingQuests = [] as Quest[];

    wikiQuests.forEach((wikiQuest) => {
        const localQuest = localQuests.find((localQuest) => (localQuest.name === wikiQuest.name));
        if (localQuest == null) missingQuests.push(wikiQuest);
    })

    return(missingQuests);
}

const addSkillRequirements = (questList: Quest[]) => new Promise<Quest[]>(function (resolve, reject){
    axios(QUEST_REQ_LIST_URL) // get the quest requirements
    .then(response => {
        const html = response.data;
        const $ = load(html);

        SKILLS_ARRAY.forEach((skillName) => {
           let base =  $(`#${skillName}`, html).parent() // find the title
           if(skillName === 'Combat_level') base = base.next("ul");
           else base = base.next("div").find("ul"); // combat level doesn't have a div
           
            base
                .find("li")
                .each(function(){
                    const htmlLine = $(this).html() as any;

                    const questReq = {} as SkillReq;
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

                    const questUrl = `https://oldschool.runescape.wiki${partialUrl}`;

                    const questIndex = questList.findIndex((quest: Quest) => quest.url === questUrl);
                    if (questIndex === -1) console.warn(`Warning: couldnt find a quest for requirement with link: ${questUrl}`);
                    else {
                        if (questList[questIndex].skillsRequired == null) questList[questIndex].skillsRequired = [];
                        questList[questIndex].skillsRequired.push(questReq);
                    }
            })
        })

        resolve(questList);
    })
})

// TODO
const addSkillRewards = (questList: Quest[]) => new Promise<Quest[]>(function (resolve, reject){
    axios(QUEST_REW_LIST_URL)
        .then(response => {
            const html = response.data.replace(/(\r\n|\n|\r)/gm, "");
            let $ = load(html);

            SKILLS_ARRAY.forEach((skillName) => {

            // to be continued



            })


           resolve(questList); 
        })
})

export {findMissingQuests, readQuestFile, extractQuestInfo, getBaseQuestList, addSkillRequirements, addSkillRewards}