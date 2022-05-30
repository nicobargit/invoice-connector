const whop = require('./whop.js')
const stripe = require('./stripe.js')
const discord = require('./discord.js')
const mongo = require('./mongodb.js')

const fs = require('fs');

try {
    let config = JSON.parse(fs.readFileSync('config.json'));

    whop.start(config.whop_private_key, 60000)
    mongo.start(config.mongodb_auth_url, 60000)

    setTimeout(function () {
        stripe.start(config.stripe_secret_key, 5000)
        discord.start(config.discord_bot_token)

        setInterval(function () {
            let newInvoices = stripe.getNewPaidInvoices()
            // console.log(newInvoices)
            if (newInvoices.length > 0) {
                for(let i=0; i<newInvoices.length; i++) {
                    let invoice_data = getInvoiceData(newInvoices[i])
                    // console.log(invoice_data)
                    mongo.checkStoredInvoiceStatus(invoice_data.id).then(stored_status => {
                        if (checkActionNeeded(stored_status, invoice_data.status)) {
                            mongo.addOrReplaceInvoice(invoice_data)
                            discord.sendWebhook(invoice_data, config.discord_channel_id, config.discord_embed)
                        }
                    })
                }
            }
            console.log("Users: " + Object.keys(whop.getUsers()).length)
            console.log("New Invoices: " + newInvoices.length)
        }, 5000)
    }, 5000)
}
catch (e) {
    console.log("Malformed config.json file")
}

function checkActionNeeded(stored_status, current_status) {
    console.log("--- CHECKING ACTION ---\n --- Stored: " + stored_status + "\n --- Current: " + current_status)
    return stored_status !== current_status && ((stored_status === "missing_cf" || stored_status === "not_found") && current_status === "ready") ||
        ((stored_status === "not_found") && current_status === "missing_cf");
}

function getInvoiceData(invoice) {
    let status = ""
    let cod_f = ""
    let user_key = ""
    let discord_name = ""
    let discord_id = ""

    let user_data = whop.getFromEmail(invoice.customer_email)
    if (user_data) {
        user_key = user_data.key
        discord_name = user_data.name
        discord_id = user_data.id

        let cf = mongo.getFiscalCodeFromKey(user_data.key)
        if (cf && cf.cf) {
            status = "ready"
            cod_f = cf.cf
        }
        else {
            status = "missing_cf"
            cod_f = "MISSING"
        }
    }
    else {
        status = "error_email"
        user_key = "not_found"
        discord_name = "not_found"
        discord_id = "not_found"
        cod_f = "MISSING"
    }

    let invoice_data = {
        id: invoice.id,
        number: invoice.number,
        status: status,
        first_name: invoice.customer_name.split(" ")[1],
        last_name: invoice.customer_name.split(" ")[0],
        address_1: invoice.customer_address.line1,
        address_2: invoice.customer_address.line2,
        city: invoice.customer_address.city,
        state: invoice.customer_address.state,
        postal_code: invoice.customer_address.postal_code,
        country: invoice.customer_address.country,
        cod_f: cod_f,
        amount_paid: invoice.amount_paid,
        key: user_key,
        discord_name: discord_name,
        discord_id: discord_id,
        email: invoice.customer_email,
        pdf: invoice.invoice_pdf,
        timestamp: Date.now(),
        sent: false
    }
    return invoice_data
}