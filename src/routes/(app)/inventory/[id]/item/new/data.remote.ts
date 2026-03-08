import {form} from "$app/server";
import * as v from 'valibot';

export const createItem = form(v.object({
    inventory_uuid: v.string(),
    user: v.string(),
    name: v.string(),
    description: v.string(),
    amount: v.number(),
    price: v.number(),
    currency: v.string(),
    image: v.file(),
    url: v.string(),
    part_number: v.string()
}),
async ({inventory_uuid,user,name,description,amount,price,currency,image,url,part_number}): Promise<{success:boolean,message:string|undefined}> => {

    return {success:true,message:undefined};
});