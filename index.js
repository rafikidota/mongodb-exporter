#!/usr/bin/env node
import { MongoClient } from 'mongodb';
import { spawn } from 'child_process';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();
const DB_URI = process.env.DB_URI;
const DB_NAME = process.env.DB_NAME;
const OUTPUT_DIR = process.env.OUTPUT_DIR;
const client = new MongoClient(DB_URI);

async function run() {
    try {
        fs.rmSync('db', { recursive: true, force: true });
        await client.connect();

        const db = client.db(DB_NAME);
        const collections = await db.collections();

        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR);
        }

        collections.forEach(async (c) => {
            const name = c.collectionName;
            await spawn('mongoexport', [
                '--db',
                DB_NAME,
                '--collection',
                name,
                '--jsonArray',
                '--pretty',
                `--out=./${OUTPUT_DIR}/${name}.json`,
            ]);
        });
    } finally {
        await client.close();
        console.log(`DB Data for ${DB_NAME} has been written to ./${OUTPUT_DIR}/`);
    }
}
run().catch(console.dir);