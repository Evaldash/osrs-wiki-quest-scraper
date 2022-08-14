const BoneVoyageJSON = 
`	{
	"name": "Bone Voyage",
	"shortName": "BoneVoyage",
	"url": "https://oldschool.runescape.wiki/w/Bone_Voyage",
	"series": "",
	"releaseOrder": "132",
	"members": true,
	"miniquest": false
}`;

export const boneVoyage = JSON.parse(BoneVoyageJSON);

const aKingdomDividedJSON =
`	{
	"name": "A Kingdom Divided",
	"shortName": "AKingdomDivided",
	"url": "https://oldschool.runescape.wiki/w/A_Kingdom_Divided",
	"series": "Great Kourend",
	"releaseOrder": "150",
	"members": true,
	"miniquest": false,
	"skillsRequired": [
		{
			"skill": "Agility",
			"boostable": false,
			"level": "54"
		},
		{
			"skill": "Crafting",
			"boostable": false,
			"level": "38"
		},
		{
			"skill": "Herblore",
			"boostable": false,
			"level": "50"
		},
		{
			"skill": "Magic",
			"boostable": false,
			"level": "35"
		},
		{
			"skill": "Mining",
			"boostable": false,
			"level": "42"
		},
		{
			"skill": "Thieving",
			"boostable": false,
			"level": "52"
		},
		{
			"skill": "Woodcutting",
			"boostable": false,
			"level": "52"
		}
	]
}
`;
export const aKingdomDivided = JSON.parse(aKingdomDividedJSON);

const dreamMentorJSON = 
`{
    "name": "Dream Mentor",
    "shortName": "DreamMentor",
    "url": "https://oldschool.runescape.wiki/w/Dream_Mentor",
    "series": "",
    "releaseOrder": "125",
    "members": true,
    "miniquest": false,
    "skillsRequired": [
        {
            "skill": "Combat_level",
            "boostable": false,
            "level": "85"
        }
    ]
}
`;
export const dreamMentor = JSON.parse(dreamMentorJSON);