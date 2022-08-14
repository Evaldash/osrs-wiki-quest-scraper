import { VERBOSE_DEBUG_ENABLED } from './../constants';
import chalk = require("chalk");
import * as fs from 'fs';

export const omitKeys = (obj: any, keys: string[]) => {
    var dup = {} as any;
    for (const key in obj) {
        if (keys.indexOf(key) == -1) {
            dup[key] = obj[key];
        }
    }
    return dup;
}

export const toPascalCase = (string: string) => {
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

export const verboseDebug = (msg: string) => {
    if (!VERBOSE_DEBUG_ENABLED) return
    console.log(msg);
}

export const writeCheerioToFile = (html: string) => {
    fs.writeFile ("./output/downloaded.html", html, function(err) {
        if (err) throw err;
         console.log(chalk.green('Downloaded html saved to /output/downloaded.html'));
         }
     );
}