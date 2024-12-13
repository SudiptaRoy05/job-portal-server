const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        const database = client.db("job-application");
        const jobCollection = database.collection("jobCollection");
        const jobApplyCOllection = database.collection('jobApplyCOllection')

        app.get('/jobs', async (req, res) => {
            const cursor = jobCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await jobCollection.findOne(query);
            res.send(result);
        })

        // job applicationapi

        app.post('job_applications',async(req, res)=>{
            const application = req.body;
            const result = await jobApplyCOllection.insertOne(application);
            res.send(result);
        })


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