const stripe = require('stripe')('sk_test_51LL9sGEl9RLg2yjvlLfibzGH6XETW5cpkDv8dvoGY4Ik9o3u7UjRcs2o84VZbGP4iD45l0bf90HB18358WLnPVnZ00NRZ9dQsd')

class ProfileController {
    async indexSubscriptions(req, res) {
        const customerId = req.params.customer_id

        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            expand: ['data.default_payment_method'],
        })

        if (subscriptions && subscriptions.data.length) {
            res.send({
                status: true,
                data: subscriptions.data
            })
        }

        res.send({
            status: false,
            message: 'No subscriptions found'
        })
    }
}

module.exports = ProfileController