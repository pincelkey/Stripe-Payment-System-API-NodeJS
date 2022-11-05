const express = require('express')
const app = express();
const bodyParser = require('body-parser');

const PaymentController = require('./controllers/PaymentController')
const paymentController = new PaymentController()

app.use(bodyParser.json())

app
    .post('/login', paymentController.login)
    .post('/orders/:product_type', paymentController.storeOrders)


module.exports = app