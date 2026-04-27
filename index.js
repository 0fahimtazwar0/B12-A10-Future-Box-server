const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 3q9J6Ge8Q5a99RyY
const uri =
  "mongodb+srv://BookHavenAdmin:3q9J6Ge8Q5a99RyY@cluster0.gfzm6tk.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function run() {
  try {
    await client.connect();

    const booksDB = client.db("booksDB");
    const booksColl = booksDB.collection("books");

    const allBooksProject = { summary: 0, userEmail: 0, created_at: 0 };
    app.get("/all-books", async (req, res) => {
      const cursor = booksColl
        .find()
        .sort({ created_at: -1 })
        .project(allBooksProject);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/my-books", async (req, res) => {
      const email = req.headers["email"];
      const query = { userEmail: email };
      const cursor = booksColl.find(query).sort({ created_at: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/add-book", async (req, res) => {
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
