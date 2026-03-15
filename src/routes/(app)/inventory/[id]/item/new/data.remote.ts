import {form} from "$app/server";
import * as v from 'valibot';

export const createItem = form(v.object({
    inventory_uuid: v.string(),
    user: v.string(),
    name: v.string(),
    description: v.optional(v.string(), undefined),
    amount: v.number(),
    unit_type: v.string(),
    unit: v.string(),
    part_number: v.optional(v.string(), undefined),
    labels: v.optional(v.array(v.string()), []),
    price: v.number(),
    currency: v.string(),
    image: v.optional(v.file(), undefined),
    url: v.optional(v.string(), undefined)
}),
async ({inventory_uuid,user,name,description,amount,unit_type,unit,part_number,labels,price,currency,image,url}): Promise<{success:boolean,message:string|undefined}> => {

    return {success:true,message:undefined};
});