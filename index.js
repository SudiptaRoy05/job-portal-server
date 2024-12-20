const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


const logger = (req, res, next) => {
    console.log('inside the logger');
    next();
}

const verifyToken = (req, res, next) => {
    // console.log('Token verified');
    // const token = req?.cookies?.token;
    // if (!token) {
    //     return res.status(401).send({ message: 'Unauthorized access' })
    // }
    // jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    //     if(error){
    //         return res.status(401).send({message:'Unauthorized access'})
    //     }
        
    // })
    next();
}


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

        // auth api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: false, // Set to true in production (for HTTPS)
                sameSite: 'Lax', // Lax for local development
            });
            res.json({ success: true });
        });


        // jobs api 
        app.get('/jobs', logger, async (req, res) => {
            const email = req.query.email;
            let query = {};
            if (email) {
                query = { hr_email: email }
            }
            const cursor = jobCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await jobCollection.findOne(query);
            res.send(result);
        })
        app.post('/jobs', async (req, res) => {
            const job = req.body;
            const result = await jobCollection.insertOne(job);
            res.send(result);
        })


        // job applicationapi

        app.get('/jobApplications/jobs/:job_id', async (req, res) => {
            const jobId = req.params.job_id;
            console.log(jobId)
            const query = { job_id: jobId };
            const result = await jobApplyCOllection.find(query).toArray();
            console.log(result)
            res.send(result);
        })

        app.get('/jobApplications', verifyToken, async (req, res) => {
            const userEmail = req.query.email;
            console.log('User Email:', userEmail);
            console.log('Cookies:', req.cookies); // Should now log the token in cookies

            const query = { applicant_email: userEmail };
            const result = await jobApplyCOllection.find(query).toArray();
            for (const a of result) {
                const query1 = { _id: new ObjectId(a.job_id) };
                const job = await jobCollection.findOne(query1);
                if (job) {
                    a.title = job.title;
                    a.company = job.company;
                    a.company_logo = job.company_logo;
                }
            }
            res.send(result);
        });

        app.post('/jobApplications', async (req, res) => {
            const application = req.body;
            const result = await jobApplyCOllection.insertOne(application);
            res.send(result);
        })

        app.patch('/jobApplications/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: data.status
                }
            }
            const result = await jobApplyCOllection.updateOne(filter, updatedDoc);
            res.send(result)
        })

        app.delete('/jobApplications/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await jobApplyCOllection.deleteOne(query);
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