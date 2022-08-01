const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const fs = require('fs')

const app = express();
const PORT = 8000;

class Quest{
    name;
    uri;
    partialUri;

    reqs = [];
}

class QuestReq{
    skill;
    level;
    boostable;

    partialUri;
}

function writeToFileAsJSON(data, filename){
    fs.writeFile (filename, JSON.stringify(data), function(err) {
        if (err) throw err;
        console.log('complete');
        }
    );
}

function omitKeys(obj, keys)
{
    var dup = {};
    for (var key in obj) {
        if (keys.indexOf(key) == -1) {
            dup[key] = obj[key];
        }
    }
    return dup;
}


const questListURL = 'https://oldschool.runescape.wiki/w/Quests/List';
const questReqURL = 'https://oldschool.runescape.wiki/w/Quests/Skill_requirements';
const questList = [];
const skillNames = [
    'Agility', 'Attack', 'Construction', 'Cooking', 'Crafting', 'Defence', 'Farming', 'Firemaking', 'Fishing', 'Fletching', 'Herblore',
    'Hitpoints', 'Hunter', 'Magic', 'Mining', 'Prayer', 'Ranged', 'Runecraft', 'Slayer', 'Smithing', 'Strength', 'Thieving', 'Woodcutting'
]

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
                            quest.partialUri = questLink;
                            quest.uri = `https://oldschool.runescape.wiki${questLink}`;

                            questList.push(quest);
                        }
                    })
                
            })
            
            axios(questReqURL) // get the quest requirements
                    .then(response => {
                        html = response.data;
                         $ = cheerio.load(html);

                        skillNames.forEach((skillName) => {

                            $(`#${skillName}`, html)
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
                                    
                                    switch ($(this).find("a").attr("href")){
                                        case '/w/Forgettable_Tale_of_a_Drunken_Dwarf': questReq.partialUri = '/w/Forgettable_Tale...'; break;
                                        case '/w/Slug_Menace': questReq.partialUri = '/w/The_Slug_Menace'; break;
                                        case '/w/Tears_of_Guthix_(quest)': questReq.partialUri = '/w/Tears_of_Guthix'; break;
                                        case '/w/Underground_Pass_(quest)': questReq.partialUri = '/w/Underground_Pass'; break;
                                        default: questReq.partialUri = $(this).find("a").attr("href"); break;
                                    }

                                    const questIndex = questList.findIndex(quest => quest.partialUri === questReq.partialUri);
                                    if (questIndex === -1) console.warn("Warning: couldnt find a quest for requirement");
                                    else questList[questIndex].reqs.push(omitKeys(questReq, ['partialUri']));
                                    
                            })
                        })
                        //console.log(questList);
                        writeToFileAsJSON(questList, "quests.json");

                    })
            
        })
} catch(err){/*console.log("Error caught: ", err)*/}