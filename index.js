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
        const usersCollection = database.collection('users');
        const MyOrder = database.collection('orders');
        const BloodRequest = database.collection('requests');


        // GET donors
        app.get('/donors', async (req, res) => {
            const cursor = donorCollection.find({});
            const donors = await cursor.toArray();
            res.send(donors);
        });


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

        // GET Reviews
        app.get('/requests', async (req, res) => {
            const cursor = BloodRequest.find({});
            const requests = await cursor.toArray();
            res.send(requests);
        });

        // POST Review
        app.post('/requests', async (req, res) => {
            const request = req.body;
            console.log('hit the post api', request);
            const result = await BloodRequest.insertOne(request);
            console.log(result);
            res.json(result)
        });

        // GET orders 
        app.get('/orders', async (req, res) => {
            const cursor = MyOrder.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // GET all order by email
        app.get("/myOrders/:email", (req, res) => {
            console.log(req.params);
            MyOrder
                .find({ email: req.params.email })
                .toArray((err, results) => {
                    res.send(results);
                });
        });

        //DELETE my order
        app.delete('/myOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await MyOrder.deleteOne(query);
            res.json(result);
        })

        // POST orders
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log('hit the post api', order);
            const result = await MyOrder.insertOne(order);
            console.log(result);
            res.json(result)
        });

        // DELETE orders from ManageOrders
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await MyOrder.deleteOne(query);
            res.json(result);
        });


        // user and admin part

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

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        //Update get
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await MyOrder.findOne(query);
            // console.log('load user with id: ', id);
            res.send(user);
        })

        //  update
        app.put("/updateStatus/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };

            MyOrder
                .updateOne(filter, {
                    $set: {
                        status: "Shipped"
                    },
                })
                .then((result) => {
                    res.send(result);
                    console.log(result);
                });

        });

        // PAYMENT
       /*  app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    payment: payment
                }
            };
            const result = await MyOrder.updateOne(filter, updateDoc);
            res.json(result);
        });

        app.post('/create-payment-intent', async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']
            });
            res.json({ clientSecret: paymentIntent.client_secret })
        }) */


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