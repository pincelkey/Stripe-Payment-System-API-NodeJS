const stripe = require('stripe')('sk_test_51LL9sGEl9RLg2yjvlLfibzGH6XETW5cpkDv8dvoGY4Ik9o3u7UjRcs2o84VZbGP4iD45l0bf90HB18358WLnPVnZ00NRZ9dQsd')

class PaymentController {
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
}

module.exports = PaymentController