import postgres from 'postgres';
import {env} from "$env/dynamic/private";

const sql = postgres({
    host: env.DB_HOST,
    port: Number.parseInt(env.DB_PORT),
    database: env.DB_DATABASE,
    username: env.DB_USER,
    password: env.DB_PASSWORD
});

export default sql;