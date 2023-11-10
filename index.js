const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken');

// MIDDLE WARE 
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId, Collection } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kpsrg5b.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect()

        // ALL COLLECTION LIST
        const userCollection = client.db('bistroDb').collection("users")
        const menuCollection = client.db('bistroDb').collection("menu")
        const reviewsCollection = client.db('bistroDb').collection("reviews")
        const cartCollection = client.db('bistroDb').collection("cart")

        // USER APII COLLECTION
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result)
        })
        app.post("/users", async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                return res.send({ massage: 'Alrady Have an user' })
            }
            const result = await userCollection.insertOne(user)
            res.send(result)
        });

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc)
            res.send(result)
        })
        // MENU Collection
        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray()
            res.send(result)
        });

        // REVIEW Collection 
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray()
            res.send(result)
        });

        // CART CALLECTION ADDED 
        app.get('/carts', async (req, res) => {
            const email = req.query.email
            // console.log(email);
            if (!email) {
                res.send([])
            }
            const query = { email: email }
            const result = await cartCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/carts', async (req, res) => {
            const item = req.body;
            const result = await cartCollection.insertOne(item)
            res.send(result)
        })

        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query)
            res.send(result)
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Boss Is Running || Hello Rezvi Rayhan")
})

app.listen(port, () => {
    console.log(`Bistro Boss Server Is Running On Port ${port}`);
})