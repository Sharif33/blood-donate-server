const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
// const stripe = require('stripe')(process.env.STRIPE_SECRET);
// dotenv
require('dotenv').config()
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w273s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// middleware
app.use(cors());
app.use(express.json());

async function run() {
    try {
        await client.connect();
        const database = client.db('donorManagement');
        const donorCollection = database.collection('donors');
        const BloodRequest = database.collection('requests');
        const DonorMsg = database.collection('msgForDonor');
        const NearestDonor = database.collection('nearestDonor');
        const usersCollection = database.collection('users');


        // GET donors
        app.get('/donors', async (req, res) => {
            const cursor = donorCollection.find({});
            const donors = await cursor.toArray();
            res.send(donors);
        });
        // GET donors
        /* app.get('/donors', async (req, res) => {
            const cursor = donorCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let donors;
            const count = await cursor.count();
            if (page){
                donors = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                 donors = await cursor.toArray();
            }
           res.send({
               count,
               donors
            });
        });
 */

        // DELETE donors from ManageProducts
        app.delete('/donors/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await donorCollection.deleteOne(query);
            res.json(result);
        });


        // GET Single donor
        app.get('/donors/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const donor = await donorCollection.findOne(query);
            res.json(donor);
        })

        // POST donor
        app.post('/donors', async (req, res) => {
            const donor = req.body;
            console.log('hit the post api', donor);
            const result = await donorCollection.insertOne(donor);
            console.log(result);
            res.json(result)
        });

        // GET Requests
        app.get('/requests', async (req, res) => {
            const cursor = BloodRequest.find({});
            const requests = await cursor.toArray();
            res.send(requests);
        });

        // POST Requests
        app.post('/requests', async (req, res) => {
            const request = req.body;
            console.log('hit the post api', request);
            const result = await BloodRequest.insertOne(request);
            console.log(result);
            res.json(result)
        });
        // GET DonorMsg
        app.get('/msgForDonor', async (req, res) => {
            const cursor = DonorMsg.find({});
            const requests = await cursor.toArray();
            res.send(requests);
        });

        // POST DonorMsg
        app.post('/msgForDonor', async (req, res) => {
            const request = req.body;
            console.log('hit the post api', request);
            const result = await DonorMsg.insertOne(request);
            console.log(result);
            res.json(result)
        });
        // GET DonorNearest
        app.get('/nearestDonor', async (req, res) => {
            const cursor = NearestDonor.find({});
            const nearest = await cursor.toArray();
            res.send(nearest);
        });

        // POST DonorNearest
        app.post('/nearestDonor', async (req, res) => {
            const nearest = req.body;
            console.log('hit the post api', nearest);
            const result = await NearestDonor.insertOne(nearest);
            console.log(result);
            res.json(result)
        });
         // DELETE nearest from ManageProducts
         app.delete('/nearestDonor/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await NearestDonor.deleteOne(query);
            console.log(result);
            res.json(result);
        });

            /* user and admin part */

          // GET users 
          app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        });

        // single user
        app.get('/usersEmail/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            // console.log(user);
            res.send(user);
        });

        // admin create
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // user post
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        });

        // user update
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // user update by their email
        app.put("/users/:email", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            // console.log(user);
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // make admin with jwt
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });
    
        /* user and admin part end */
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Network Server is Runnning')
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});