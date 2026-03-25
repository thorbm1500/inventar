import {form} from "$app/server";
import * as v from 'valibot';

export const createItem = form(v.object({
    inventory: v.pipe(v.string(), v.nonEmpty()),
    user: v.pipe(v.string(), v.nonEmpty()),
    name: v.pipe(v.string(), v.nonEmpty()),
    description: v.optional(v.string(), undefined),
    amount: v.optional(v.number(), undefined),
    unit_type: v.optional(v.string(), undefined),
    unit: v.optional(v.string(), undefined),
    part_number: v.optional(v.string(), undefined),
    labels: v.optional(v.array(v.string()), []),
    price: v.optional(v.number(), undefined),
    currency: v.optional(v.string(), undefined),
    image: v.optional(v.file(), undefined),
    url: v.optional(v.string(), undefined),
    external_fetch: v.optional(v.boolean(), undefined)
}),
async ({inventory,user,name,description,amount,unit_type,unit,part_number,labels,price,currency,image,url,external_fetch}): Promise<{success:boolean,message:string|undefined}> => {

    return {success:true,message:undefined};
});