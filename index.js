const whop = require('./whop.js')
const stripe = require('./stripe.js')
const discord = require('./discord.js')

const fs = require('fs');

try {
    let config = JSON.parse(fs.readFileSync('config.json'));

    whop.start(config.whop_private_key, 60000)
    stripe.start(config.stripe_secret_key, 5000)
    discord.start(config.discord_bot_token)

    setInterval(function () {
        var newInvoices = stripe.getNewPaidInvoices()
        if (newInvoices.length > 0) {
            newInvoices.forEach(invoice => {
                var user_inv = whop.getFromEmail(invoice.customer_email)
                if (user_inv) {
                    discord.sendWebhook(invoice, user_inv, config.discord_channel_id, config.discord_embed)
                }
                else {
                    discord.sendErrorWebhook(invoice, config.discord_channel_id, config.discord_embed)
                }
            });
        }
        console.log("Users: " + Object.keys(whop.getUsers()).length)
        console.log("New Invoices: " + newInvoices.length)
    }, 5000)
}
catch (e) {
    console.log("Malformed config.json file")
}


