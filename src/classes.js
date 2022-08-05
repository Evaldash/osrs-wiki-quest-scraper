class Quest{
    miniquest;
    name;
    shortName;
    url;
    members;
    difficulty;
    subquests;
    questLength;
    requirements = [];
    series;
    rewards = [];
    description;

    itemsRequired;
    itemsRecommended;
    enemiesToDefeat;
}
class QuestReq{
   url;
   skill;
   level;
   boostable;
}

class QuestReward{
   exp;
   questPoints;
   miscellaneous;
   other;
}

module.exports = {Quest, QuestReq, QuestReward};