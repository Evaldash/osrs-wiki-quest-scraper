import * as  path from 'path';
import * as fs from 'fs';
import {load} from 'cheerio';
import axios from 'axios';

import {Quest, QuestReq, QuestReward} from './types';
import chalk = require('chalk');

import { verboseDebugEnabled } from '.';

export const omitKeys = (obj: any, keys: string[]) => {
    var dup = {} as any;
    for (const key in obj) {
        if (keys.indexOf(key) == -1) {
            dup[key] = obj[key];
        }
    }
    return dup;
}

const toPascalCase = (string: string) => {
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

// TODO: identify f2p, members, and miniquests
export const getBaseQuestList = () => new Promise<Quest[]>(function (resolve, reject){
    const qListURL = 'https://oldschool.runescape.wiki/w/Quests/List';
    const qList: Quest[] = [];

    try {
        axios(qListURL) // get all quests
            .then(response => {
                const html = response.data.replace(/(\r\n|\n|\r)/gm, "");
                let $ = load(html);

  
                $(".wikitable", html).each(function() {
                    let questNumberColIndex = -1, nameColIndex = -1, seriesColIndex = -1, relDateColIndex = -1;
                    let wikitable = this;

                    const sectionTitle = $(wikitable).prevAll("h2").first().find("span").attr("id");

                    const isMembersTable   = (sectionTitle === "Members'_quests");
                    const isF2pTable       = (sectionTitle === "Free-to-play_quests");
                    const isMiniquestTable = (sectionTitle === "Miniquests");

                    // find column places
                    $(wikitable)  
                        .find("tbody")
                        .find("tr")
                        .first()
                        .find("th")
                        .each((i, el) => {
                            switch($(el).text()) {
                                case "#":            questNumberColIndex = i;   break;
                                case "Name":         nameColIndex = i;          break;
                                case "Series":       seriesColIndex = i;        break;

                                // case "QP Reward":    qPointsRewardColIndex = i; break; FIXME: handle special column
                                // case "Release date": relDateColIndex = i;       break; FIXME: multiple a elements inside
                                
                                case "Difficulty": case "Length": {} break;
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
                                    quest.url = `https://oldschool.runescape.wiki${questLink}`;
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


const verboseDebug = (msg: string) => {
    if (!verboseDebugEnabled) return

    console.log(msg);
}


const writeCheerioToFile = (html: string) => {
    fs.writeFile ("./output/downloaded.html", html, function(err) {
        if (err) throw err;
         console.log(chalk.green('Downloaded html saved to /output/downloaded.html'));
         }
     );
}

export const extractQuestInfo = (quest: Quest) => new Promise<Quest|null>(function (resolve, reject){
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
                resolve(quest);
        })
})


export const readQuestFile = () => new Promise<Quest[]|null>(function (resolve, reject){
    try{
        const filePath = path.join(__dirname, '../output/quests-TODO.json');
        const quests = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Quest[];
        resolve(quests);
    }
    catch(err) {
        reject(err)
    }
})


export const findMissingQuests = (wikiQuests: Quest[], localQuests: Quest[]) => {
    const missingQuests = [] as Quest[];

    wikiQuests.forEach((wikiQuest) => {
        const localQuest = localQuests.find((localQuest) => (localQuest.name === wikiQuest.name));
        if (localQuest == null) missingQuests.push(wikiQuest);
    })

    return(missingQuests);
}