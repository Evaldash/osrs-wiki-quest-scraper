export type Quest = {
    releaseOrder: string,
   
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


export type QuestReward = {
   exp: string;
   questPoints: string;
   miscellaneous: string[];
   other: string[];
}






export type SkillReq = {
   skill: string;
   level: number;
   boostable: boolean;
}

export type ItemReq = {
   name: string;
   qty: number;
}





/**
 *  @deprecated, the Type should not be used
 */ 
export type QuestReq = {
   url: string;
   skill: string;
   level: string;
   boostable: boolean;
}