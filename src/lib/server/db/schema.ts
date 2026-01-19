export const INVENTORIES		 = `CREATE TABLE IF NOT EXISTS inventories 
									(
    								inventory_uuid UUID PRIMARY KEY DEFAULT uuidv7(),
    								name VARCHAR(255) NOT NULL,
    								description TEXT DEFAULT NULL
									)`

export const CATEGORIES      	 = `CREATE TABLE IF NOT EXISTS categories 
									(
    								category_uuid UUID PRIMARY KEY DEFAULT uuidv7(),
									inventory_uuid UUID PRIMARY KEY,
									name VARCHAR(255) NOT NULL,
									description TEXT DEFAULT NULL,
									FOREIGN KEY(inventory_uuid) REFERENCES inventories(inventory_uuid) ON DELETE CASCADE
							   		)`

export const CURRENCIES			 = `CREATE TABLE IF NOT EXISTS currencies
                           			(
                               		currency_code VARCHAR(3) PRIMARY KEY,
								   	currency_number SMALLINT NOT NULL,
								   	currency_symbol VARCHAR(255) DEFAULT NULL
                           			)`

export const ITEMS 				 = `CREATE TABLE IF NOT EXISTS items 
									(
   		 							item_uuid UUID PRIMARY KEY DEFAULT uuidv7(),
									name VARCHAR(255) NOT NULL,
									description TEXT DEFAULT NULL,
									url VARCHAR(255) DEFAULT NULL,
									assets_path VARCHAR(255) DEFAULT NULL,
									price BIGINT NOT NULL,
									currency VARCHAR(3) DEFAULT 'EUR',
									amount BIGINT DEFAULT 0,
             		       	        FOREIGN KEY(currency) REFERENCES currencies(currency_code) ON DELETE CASCADE
									)`

export const ITEM_CATEGORIES	 = `CREATE TABLE IF NOT EXISTS item_categories 
									(
									inventory_uuid UUID PRIMARY KEY,
									item_uuid UUID PRIMARY KEY,
									category_uuid UUID PRIMARY KEY,
									FOREIGN KEY(inventory_uuid) REFERENCES inventories(inventory_uuid) ON DELETE CASCADE,
									FOREIGN KEY(item_uuid) REFERENCES items(item_uuid) ON DELETE CASCADE,
									FOREIGN KEY(category_uuid) REFERENCES categories(category_uuid) ON DELETE CASCADE
									)`

export const PENDING_ITEM_CHANGES = `CREATE TABLE IF NOT EXISTS pending_item_changes
									 (
									 inventory_uuid UUID PRIMARY KEY,
									 item_uuid UUID PRIMARY KEY,
									 in_order BIGINT DEFAULT 0,
									 reserved BIGINT DEFAULT 0,
									 FOREIGN KEY(inventory_uuid) REFERENCES inventories(inventory_uuid) ON DELETE CASCADE,
									 FOREIGN KEY(item_uuid) REFERENCES items(item_uuid) ON DELETE CASCADE	 
									 )`