NodeJS script to scrape the Runescape wiki and get all current quests, along with their requirements from these two pages:
<code> https://oldschool.runescape.wiki/w/Quests/List </code>

<code> https://oldschool.runescape.wiki/w/Quests/Skill_requirements </code>

NodeJS and yarn/npm required.

To run:
1. Clone the repo by executing <code> git clone https://github.com/Evaldash/oswiki-quest-scraper </code>
2. Enter the folder you cloned the repo to, and run <code> yarn install </code>
3. Run <code> yarn generate </code>

To test, run <code> yarn test </code>

Assuming all went well (and the oswiki layout didn't change...), quest list with requirements should be available in the <code> quests.json </code> file.
