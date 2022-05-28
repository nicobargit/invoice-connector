const Discord = require('discord.js');

const client = new Discord.Client();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
// client.on('debug', console.log);

module.exports = {
    sendWebhook: function (invoice, user, channel_id, embed_configs, cf) {
        client.channels.cache.get(channel_id).send(getWebhook(invoice, user, embed_configs, cf));
    },
    sendWebhookNoCF: function (invoice, user, channel_id, embed_configs) {
        client.channels.cache.get(channel_id).send(getWebhook(invoice, user, embed_configs));
    },
    sendErrorWebhook: function (invoice, channel_id, embed_configs) {
        client.channels.cache.get(channel_id).send(getErrorWebhook(invoice, embed_configs));
    },
    start: function (auth_key) {
        client.login(auth_key);
    },
    stop: function () {
        clearInterval(interval)
    },
    update: function () {
        evaluateInvoices()
    }
};

function evaluateInvoices() {
    stripe.invoices.list({ limit: 100 }).then(r => {
        r.data.filter(i => i.status === 'paid').forEach(element => {
            result = paidInvoicesCatalog.filter(i => i.number === element.number);
            if (result.length === 0) {
                stripe.invoices.retrieve(element.id).then(inv => {
                    newPaidInvoices.push(inv)
                    console.log("New paid invoice found at " + new Date().toISOString());
                });

            }

        });
        paidInvoicesCatalog = r.data.filter(i => i.status === 'paid');
        console.log("Invoices evaluated at " + new Date().toISOString());
    });

}

function getWebhook(invoice, user, embed_configs, cf) {
    var userInfo = "\Name: " + invoice.customer_name + "\n";
    userInfo = userInfo + "Address: " + invoice.customer_address.line1 + "\n";
    userInfo = userInfo + "Address 2: " + invoice.customer_address.line2 + "\n";
    userInfo = userInfo + "City: " + invoice.customer_address.city + "\n";
    userInfo = userInfo + "CAP: " + invoice.customer_address.postal_code + "\n";
    userInfo = userInfo + "State: " + invoice.customer_address.state + "\n";
    userInfo = userInfo + "Country: " + invoice.customer_address.country + "\n";
    userInfo = userInfo + "Cod F.: " + cf + "\n";
    return {
        embed: {
            title: invoice.id,
            url: "https://dashboard.stripe.com/invoices/" + invoice.id,
            description: "**New Paid Invoice!**",
            color: 0x08f26e,
            timestamp: new Date().toISOString(),
            footer: {
                icon_url: embed_configs.logo_img,
                text: embed_configs.name + " Invoices"
            },
            author: {
                name: "Stripe Invoices",
                icon_url: embed_configs.logo_img,
            },
            fields: [
                {
                    name: "Email",
                    value: invoice.customer_email,
                    inline: true
                },
                {
                    name: "Discord",
                    value: user.name + " (<@" + user.id + ">)",
                    inline: true
                },
                {
                    name: "Amount Paid",
                    value: parseFloat(invoice.amount_paid) / 100 + " €",
                    inline: true
                },
                {
                    name: "Key",
                    value: user.key,
                    inline: true
                },
                {
                    name: "Invoice PDF",
                    value: "[Link](" + invoice.invoice_pdf + ")",
                    inline: true
                },
                {
                    name: "Number",
                    value: invoice.number,
                    inline: true
                },
                {
                    name: "User Info",
                    value: "```" + userInfo + "```",
                    inline: true
                },
            ]
        }
    };
}

function getWebhookNoCF(invoice, user, embed_configs) {
    var userInfo = "\Name: " + invoice.customer_name + "\n";
    userInfo = userInfo + "Address: " + invoice.customer_address.line1 + "\n";
    userInfo = userInfo + "Address 2: " + invoice.customer_address.line2 + "\n";
    userInfo = userInfo + "City: " + invoice.customer_address.city + "\n";
    userInfo = userInfo + "CAP: " + invoice.customer_address.postal_code + "\n";
    userInfo = userInfo + "State: " + invoice.customer_address.state + "\n";
    userInfo = userInfo + "Country: " + invoice.customer_address.country + "\n";
    userInfo = userInfo + "Cod F.: MISSING\n";
    return {
        embed: {
            title: invoice.id,
            url: "https://dashboard.stripe.com/invoices/" + invoice.id,
            description: "**MISSING CF!**",
            color: 0xFFA500,
            timestamp: new Date().toISOString(),
            footer: {
                icon_url: embed_configs.logo_img,
                text: embed_configs.name + " Invoices"
            },
            author: {
                name: "Stripe Invoices",
                icon_url: embed_configs.logo_img,
            },
            fields: [
                {
                    name: "Email",
                    value: invoice.customer_email,
                    inline: true
                },
                {
                    name: "Discord",
                    value: user.name + " (<@" + user.id + ">)",
                    inline: true
                },
                {
                    name: "Amount Paid",
                    value: parseFloat(invoice.amount_paid) / 100 + " €",
                    inline: true
                },
                {
                    name: "Key",
                    value: user.key,
                    inline: true
                },
                {
                    name: "Invoice PDF",
                    value: "[Link](" + invoice.invoice_pdf + ")",
                    inline: true
                },
                {
                    name: "Number",
                    value: invoice.number,
                    inline: true
                },
                {
                    name: "User Info",
                    value: "```" + userInfo + "```",
                    inline: true
                },
            ]
        }
    };
}

function getErrorWebhook(invoice, embed_configs) {
    var userInfo = "\Name: " + invoice.customer_name + "\n";
    userInfo = userInfo + "Address: " + invoice.customer_address.line1 + "\n";
    userInfo = userInfo + "Address 2: " + invoice.customer_address.line2 + "\n";
    userInfo = userInfo + "City: " + invoice.customer_address.city + "\n";
    userInfo = userInfo + "CAP: " + invoice.customer_address.postal_code + "\n";
    userInfo = userInfo + "State: " + invoice.customer_address.state + "\n";
    userInfo = userInfo + "Country: " + invoice.customer_address.country + "\n";
    userInfo = userInfo + "Cod F.: null\n";
    return {
        embed: {
            title: invoice.id,
            url: "https://dashboard.stripe.com/invoices/" + invoice.id,
            description: "**Error Invoice Email mismatch!**",
            color: 0xb53737,
            timestamp: new Date().toISOString(),
            footer: {
                icon_url: embed_configs.logo_img,
                text: embed_configs.name + " Invoices"
            },
            author: {
                name: "Stripe Invoices",
                icon_url: embed_configs.logo_img,
            },
            fields: [
                {
                    name: "Email",
                    value: invoice.customer_email,
                    inline: true
                },
                {
                    name: "Discord",
                    value: "null",
                    inline: true
                },
                {
                    name: "Amount Paid",
                    value: parseFloat(invoice.amount_paid) / 100 + " €",
                    inline: true
                },
                {
                    name: "Key",
                    value: "null",
                    inline: true
                },
                {
                    name: "Invoice PDF",
                    value: "[Link](" + invoice.invoice_pdf + ")",
                    inline: true
                },
                {
                    name: "Number",
                    value: invoice.number,
                    inline: true
                },
                {
                    name: "User Info",
                    value: "```" + userInfo + "```",
                    inline: true
                },
            ]
        }
    };
}