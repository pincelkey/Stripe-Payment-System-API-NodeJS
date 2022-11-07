const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const PaymentController = require('./controllers/PaymentController')
const paymentController = new PaymentController()

const ProfileController = require('./controllers/ProfileController')
const profileController = new ProfileController()

app
    .use(cors({
        origin: 'http://localhost:3000'
    }));

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

app
    .get('/users/:customer_id/subscriptions', profileController.indexSubscriptions)
    .get('/users/:customer_id/courses', profileController.indexCourses)


module.exports = app