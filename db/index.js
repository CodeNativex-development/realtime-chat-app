import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;

const client =
    globalThis.pgClient ??
    postgres(connectionString, {
        max: 1,
        prepare: false,
    });

if (process.env.NODE_ENV !== "production") {
    globalThis.pgClient = client;
}

export const db = drizzle(client, { schema });