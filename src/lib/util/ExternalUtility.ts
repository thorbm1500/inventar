class Internal {
    static async fetch(url: string): Promise<string> {
        console.log(`Fetching price from ${url}`);
        const response = await Bun.fetch(url);
        return await response.text();
    }

    /*static parseByHTML(content: string): Promise<string | undefined> {
        let firstIndex: number = content.indexOf('price');
    }*/
}

export async function fetchItemPrice(url: string): Promise<void> {
    const body: string = await Internal.fetch(url);
    let parseAttempt: string | undefined;
    //parseAttempt = Internal.parseByHTML(body);

    const priceString = body.substring(body.indexOf('€'), body.indexOf('€') + 12).replaceAll(new RegExp(/[^\d|\.|\,]/,'gi'),'');
    console.log(priceString);
}