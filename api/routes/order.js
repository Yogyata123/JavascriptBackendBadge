const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/products");

// Handle incoming GET requests to /orders
router.get("/", (req, res, next) => {
  Order.find()
    .select("product quantity _id")
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + doc._id
            }
          };
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.post('/', async (req, res) => {
  try {
    const product = await Product.findById(req.body.productId).exec();
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    const order = new Order({
      _id: new mongoose.Types.ObjectId(),
      product: req.body.productId,
      quantity: req.body.quantity || 1
    });
    const result = await order.save();
    res.status(201).json({
      message: "Order stored",
      createdOrder: {
        _id: result._id,
        product: result.product,
        quantity: result.quantity
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/:orderId", (req, res, next) => {
  Order.findById(req.params.orderId)
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: "GET",
          url: "http://localhost:3000/orders"
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.delete('/:orderId', async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const result = await Order.deleteOne({ _id: orderId }).exec();
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Order not found" });
    } else {
      res.status(200).json({ message: "Order deleted successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;