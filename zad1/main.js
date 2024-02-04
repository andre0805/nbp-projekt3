const fs = require('fs');
const { MongoClient } = require("mongodb");

// 1. Parse the data from the file
const fileContent = fs.readFileSync('reviews.txt', 'utf-8');
const entries = fileContent.split('\n\n'); // Assuming entries are separated by two newline characters

console.log('Number of records:', entries.length);

const records = entries.slice(0, 100000).map((entry) => {
    const lines = entry.split('\n');

    try {
        const productId = lines[0].match(/product\/productId: (.*)/)
        const title = lines[1].match(/product\/title: (.*)/)
        const price = lines[2].match(/product\/price: (.*)/)
        const userId = lines[3].match(/review\/userId: (.*)/)
        const profileName = lines[4].match(/review\/profileName: (.*)/)
        const helpfulness = lines[5].match(/review\/helpfulness: (.*)/)
        const score = lines[6].match(/review\/score: (.*)/)
        const time = lines[7].match(/review\/time: (.*)/)
        const summary = lines[8].match(/review\/summary: (.*)/)
        const text = lines[9].match(/review\/text: (.*)/)

        const record = {
            product: {
                productId: productId ? productId[1] : null,
                title: title ? title[1] : null,
                price: price ? parseFloat(price[1]) : null
            },
            review: {
                userId: userId ? userId[1] : null,
                profileName: profileName ? profileName[1] : null,
                helpfulness: helpfulness ? helpfulness[1] : null,
                score: score ? parseFloat(score[1]) : null,
                time: time ? new Date(parseInt(time[1]) * 1000) : null,
                summary: summary ? summary[1] : null,
                text: text ? text[1] : null
            }
        }

        return record;
    } catch (error) {
        console.error('Error parsing record:', error.message);
        return null;
    }
})
.filter((record) => record !== null);

console.log('Number of successfully parsed records:', records.length);

// Save to reviews.json
fs.writeFileSync('reviews.json', JSON.stringify(records, null, 2));

// 2. Insert records into MongoDB
const url = 'mongodb://localhost:27017';
const dbName = 'proj3';
const collectionName = 'reviews';

const client = new MongoClient(url);

async function run() {
    try {
        console.log('Connected to MongoDB');
        
        // Get the database and collection on which to run the operation
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Drop db before inserting
        await db.dropDatabase();

        const options = { ordered: true };

        // Insert the documents in the collection
        const result = await collection.insertMany(records, options);

        console.log(`${result.insertedCount} documents inserted`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    } finally {
        await client.close();
    }
}

run();