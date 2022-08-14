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
    series: string;
    rewards: string[];
    description: string;

    itemsRequired: ItemReq[];
    itemsRecommended: string[];
    enemiesToDefeat: string[];


   skillsRequired: SkillReq[];

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