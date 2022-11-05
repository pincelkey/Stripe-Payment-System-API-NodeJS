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
}

module.exports = PaymentController