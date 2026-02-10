import * as v from 'valibot';
import {form} from "$app/server";
import type {DatabaseResult} from "$lib/server/db/database";
import * as db from '$lib/server/db/database';
import * as fs from "node:fs";
import {settings} from "$lib/server/internal/settings";
import * as Path from "node:path";

export const createInventory = form(
    v.object({
        owner: v.pipe(v.string(), v.nonEmpty()),
        name: v.pipe(v.string(), v.nonEmpty()),
        description: v.string(),
        thumbnail: v.file()
    }),
    async ({owner,name, description, thumbnail}) => {
        const result: DatabaseResult = await db.Inventories.create(owner,name,description??null);
        if (!result.success) {
            return {success:false,message:result.message};
        }

        const filePath = settings.data_dir.concat(result.result,'/');
        const imageData = await thumbnail.bytes();

        fs.mkdir(Path.resolve(filePath),{recursive:true},(err) => {
            if (err) console.error(`Failed to make directory: ${err}`);
            return {success:true,message:result.message};
        });

        fs.writeFile(Path.resolve(filePath.concat('test.png')),await thumbnail.text(),(err) => {
            console.log(err);
        });

        fs.writeFileSync(Path.resolve(filePath),imageData);
    }
);