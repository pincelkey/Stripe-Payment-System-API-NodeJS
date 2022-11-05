const stripe = require('stripe')('sk_test_51LL9sGEl9RLg2yjvlLfibzGH6XETW5cpkDv8dvoGY4Ik9o3u7UjRcs2o84VZbGP4iD45l0bf90HB18358WLnPVnZ00NRZ9dQsd')
const fs = require('fs')

class ProfileController {
    constructor() {
        this.indexCourses = this.indexCourses.bind(this);
    }

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

    indexCourses(req, res) {
        const courses = this.__readDatabase();

        res.send({
            data: courses,
            status: true,
        });
    }

    __readDatabase() {
        const data = fs.readFileSync('./database/db.json', {encoding: "utf8", flag: 'r'});

        try {
            const database = JSON.parse(data);

            return database
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = ProfileController