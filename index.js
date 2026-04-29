const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

//firebase sdk
const admin = require("firebase-admin");
const serviceAccount = require("./book-haven-fahim-firebase-adminsdk.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 3q9J6Ge8Q5a99RyY
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gfzm6tk.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyFirebaseToken = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  try {
    const info = await admin.auth().verifyIdToken(token);
    console.log("after token verification", info);
    req.token_email = info.email;
    next();
  } catch {
    return res.status(401).send({ message: "unauthorized access" });
  }
};

app.get("/", (req, res) => {
  res.send("Book Haven Server");
});

async function run() {
  try {
    await client.connect();

    const booksDB = client.db("booksDB");
    const booksColl = booksDB.collection("books");

    const allBooksProject = { summary: 0, userEmail: 0, comments: 0 };
    app.get("/all-books", async (req, res) => {
      const cursor = booksColl
        .find()
        .sort({ created_at: -1 })
        .project(allBooksProject);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/my-books", verifyFirebaseToken, async (req, res) => {
      const email = req.token_email;
      const query = { userEmail: email };
      const cursor = booksColl.find(query).sort({ created_at: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/add-book", verifyFirebaseToken, async (req, res) => {
      const newBook = req.body;
      console.log("hitting post api", newBook);
      const result = await booksColl.insertOne(newBook);
      res.send(result);
    });

    app.get("/latest-books", async (req, res) => {
      const cursor = booksColl.find().sort({ created_at: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/book-details/:id", verifyFirebaseToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksColl.findOne(query);
      res.send(result);
    });

    app.patch("/update-book/:id", verifyFirebaseToken, async (req, res) => {
      const id = req.params.id;
      const updatedBook = req.body;
      const query = { _id: new ObjectId(id) };
      const update = { $set: updatedBook };
      const result = await booksColl.updateOne(query, update);
      res.send(result);
    });
    app.delete("/delete-book/:id", verifyFirebaseToken, async (req, res) => {
      console.log("delete this book", req.params.id);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksColl.deleteOne(query);
      res.send(result);
    });

    app.post("/add-comment/:id", verifyFirebaseToken, async (req, res) => {
      const id = req.params.id;
      const newComment = req.body;
      const query = { _id: new ObjectId(id) };
      const result = await booksColl.updateOne(query, {
        $push: { comments: newComment },
      });
      res.send(result);
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
