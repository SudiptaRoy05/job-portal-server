const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lue0n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        // const database = client.db("jobApplications");
        // const jobCollection = database.collection("jobCollection");

        // app.post('jobs/',async(req, res)=>{
        //     const 
        // })


    } finally {

    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('server is running');
});

app.listen(port, () => {
    console.log(`Server is connected on port: ${port}`)
})