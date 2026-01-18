import {pgTable, text, uuid, varchar, bigint, smallint} from 'drizzle-orm/pg-core';

export const pgtInventories = pgTable('inventories', {
	uuid: uuid('inventory_uuid').defaultRandom().primaryKey(),
	name: varchar().notNull(),
	description: text().notNull()
});

export type Inventories = typeof pgtInventories.$inferSelect;

export const pgtCategories = pgTable('categories', {
	uuid: uuid('category_uuid').defaultRandom().primaryKey(),
	inventory_uuid: uuid('inventory_uuid').primaryKey().references(() => pgtInventories.uuid),
	name: varchar().notNull(),
	description: text()
});

export type Categories = typeof pgtCategories.$inferSelect;

export const pgtItems = pgTable('items', {
	uuid: uuid('item_uuid').defaultRandom().primaryKey(),
	inventory_uuid: uuid('inventory_uuid').primaryKey().references(() => pgtInventories.uuid),
	name: varchar().notNull(),
	description: text(),
	url: varchar(),
	image_path: varchar('image'),
	price: bigint({ mode: 'bigint' }).default(0n).notNull(),
	currency: varchar('currency', { length: 3 }).references(() => pgtCurrencies.currency_code),
	amount: bigint({ mode: 'bigint' }).default(0n).notNull(),
});

export type Items = typeof pgtItems.$inferSelect;

export const pgtItemCategories = pgTable('item_categories', {
	inventory_uuid: uuid().primaryKey().references(() => pgtInventories.uuid),
	item_uuid: uuid().primaryKey().references(() => pgtItems.uuid),
	category_uuid: uuid().primaryKey().references(() => pgtCategories.uuid),
});

export type ItemCategories = typeof pgtItemCategories.$inferSelect;

export const pgtCurrencies = pgTable('currencies', {
	currency_code: varchar({ length: 3 }).primaryKey(),
	currency_number: smallint().notNull(),
	currency_symbol: varchar(),
});

export type Currencies = typeof pgtCurrencies.$inferSelect;

export const pgtItemsPendingChanges = pgTable('items_pending_changes', {
	inventory_uuid: uuid().primaryKey().references(() => pgtInventories.uuid),
	item_uuid: uuid().primaryKey().references(() => pgtItems.uuid),
	in_order: bigint({ mode: 'bigint' }).default(0n).notNull(),
	reserved: bigint({ mode: 'bigint' }).default(0n).notNull(),
});

export type ItemsPendingChanges = typeof pgtItemsPendingChanges.$inferSelect;