export type Quest = {
    miniquest: boolean;
    name: string;
    shortName: string;
    url: string;
    members: boolean;
    difficulty: string;
    subquests: string[];
    questLength: string;
    requirements: string[];
    series: string;
    rewards: string[];
    description: string;

    itemsRequired: string[];
    itemsRecommended: string[];
    enemiesToDefeat: string[];
}
export type QuestReq = {
   url: string;
   skill: string;
   level: string;
   boostable: boolean;
}

export type QuestReward = {
   exp: string;
   questPoints: string;
   miscellaneous: string[];
   other: string[];
}