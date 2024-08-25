const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const userName = encodeURIComponent(process.env.USER_NAME);
const userPassword = encodeURIComponent(process.env.USER_PASSWORD);

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
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  balance: Number,
});

const Product = mongoose.model("Product", productSchema);
const User = mongoose.model("User", userSchema);

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/api/buy", async (req, res) => {
  const { userId, productId } = req.body;

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const productObjectId = new mongoose.Types.ObjectId(productId);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userObjectId).session(session);
    const product = await Product.findById(productObjectId).session(session);

    if (!user || !product) {
      throw new Error("User or Product not found");
    }

    if (user.balance < product.price) {
      throw new Error("Insufficient balance");
    }

    user.balance -= product.price;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ success: true, message: "Purchase made successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ success: false, message: error.message });
  }
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
