const stripe = require('stripe')('sk_test_51LL9sGEl9RLg2yjvlLfibzGH6XETW5cpkDv8dvoGY4Ik9o3u7UjRcs2o84VZbGP4iD45l0bf90HB18358WLnPVnZ00NRZ9dQsd')
const fs = require('fs')
class PaymentController {
    constructor() {
        this.completePayment = this.completePayment.bind(this);
    }

    async login (req, res) {
        const customer = await stripe.customers.create({
            email: req.body.email
        });

        if (customer) {
            res.send({
                data: customer,
                status: true,
            });
        } else {
            res.send({
                message: 'Customer not created',
                status: false
            });
        }
    }

    async storeOrders (req, res) {
        const productType = req.params.product_type;
        const customerId = req.body.customer_id;

        if (!customerId) {
            res.send({
                status: false,
                message: 'No customer'
            })
        }

        switch (productType) {
            case 'course':
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: 20 * 100,
                    currency: 'USD',
                    description: 'Curso de WordPress Avanzado',
                    customer: customerId,
                })

                if (paymentIntent) {
                    res.send({
                        status: true,
                        data: paymentIntent.client_secret
                    })
                }

                res.send({
                    status: false,
                    message: 'No payment intent created'
                })
                break;

            case 'subscription':
                const membershipPriceId = 'price_1Lpgj7El9RLg2yjvvd57U3yJ';
                const subscription = await stripe.subscriptions.create({
                    customer: customerId,
                    items: [{
                        price: membershipPriceId,
                    }],
                    payment_behavior: 'default_incomplete',
                    expand: ['latest_invoice.payment_intent']
                })

                if (subscription && subscription.latest_invoice) {
                    res.send({
                        status: true,
                        data: subscription.latest_invoice.payment_intent.client_secret
                    })
                }

                res.send({
                    status: false,
                    message: 'No subscription created'
                })
                break;
            default:
                res.send({
                    status: false,
                    message: 'No right product type'
                })
                break;
        }
    }

    async completePayment(req, res) {
        const STRIPE_WEBHOOK_KEY = 'whsec_8E5YhnMLLH0LPOwy5d3PeKZDgkHKEumQ'
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                req.header('Stripe-Signature'),
                STRIPE_WEBHOOK_KEY
            )
        } catch (error) {
            res.status(405);
            res.send({
                error: error.message
            })
        }

        const dataObject = event.data.object

        switch (event.type) {
            case 'invoice.payment_succeeded':
                if (dataObject['invoice'] === 'subscription_create') {
                    const subscriptionId = dataObject['subscription'];
                    const paymentIntentId = dataObject['payment_intent'];

                    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

                    try {
                        const subscription = await stripe.subscriptions.update(
                            subscriptionId,
                            {
                                default_payment_method: paymentIntent.payment_method,
                            }
                        )

                        res.send({
                            message: 'Subscription completed'
                        })
                    } catch (error) {
                        res.status(405)
                        res.send({
                            message: error.message
                        })
                    }
                }
                break;

            case 'payment_intent.succeeded':
                this.__storeDatabase(1414)

                res.send({
                    status: true,
                    message: 'Course access created'
                })
                break;
        
            default:
                console.log('Undefined event type')
                break;
        }
    }

    __storeDatabase(courseId) {
        const data = fs.readFileSync('./database/db.json', {encoding: "utf8", flag: 'r'});

        try {
            const database = JSON.parse(data);

            database.push({
                course: courseId
            })

            fs.writeFileSync('./database/db.json', JSON.stringify(database))

            return true
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = PaymentController