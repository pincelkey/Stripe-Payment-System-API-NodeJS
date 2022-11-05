const express = require('express')
const app = express();
const bodyParser = require('body-parser');

const PaymentController = require('./controllers/PaymentController')
const paymentController = new PaymentController()

app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

app
    .post('/login', paymentController.login)
    .post('/orders/:product_type', paymentController.storeOrders)
    .post('/webhook', bodyParser.raw({ type: 'application/json'}), paymentController.completePayment)
    .post('/test', paymentController.test)


module.exports = app