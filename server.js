const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const userName = encodeURIComponent(process.env.DB_USERNAME);
const userPassword = encodeURI(process.env.DB_PASSWORD);

mongoose.connect(
  `mongodb+srv://${userName}:${userPassword}@clustermarketdb.a5ztr.mongodb.net/?retryWrites=true&w=majority&appName=ClusterMarketDB`
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  reference: String,
  thumbnail: String,
});

const Product = mongoose.model("Product", productSchema);

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
