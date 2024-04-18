let express = require("express");
require("dotenv").config();
let app = express();
let cors = require("cors");
let stripe = require("stripe")(process.env.SECRET_KEY);

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ msg: "Home route" });
});

app.post("/payment", async (req, res) => {
  const lineItems = req.body.map((product) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: product.title,
        images: [product.thumbnail],
      },
      unit_amount: product.price * 100,
    },
    quantity: product.qnty ?? 1,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating Stripe link:", error);
    // throw error;
  }
});

app.listen(process.env.PORT, async () => {
  try {
    console.log(`server started at ${process.env.PORT}`);
  } catch (error) {
    console.log("something went wrong");
  }
});
