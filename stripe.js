var stripe;
var interval;

var paidInvoicesCatalog = [];
var newPaidInvoices = []

module.exports = {
    getNewPaidInvoices: function () {
        var tmp = newPaidInvoices
        newPaidInvoices = []
        return tmp
    },
    start: function (auth_key, delay) {
        stripe = require('stripe')(auth_key);
        // startFromCheckpoint but atm start from the current status
        stripe.invoices.list({ limit: 100 }).then(r => {
            paidInvoicesCatalog = r.data.filter(i => i.status === 'paid');
        });

        evaluateInvoices();
        interval = setInterval(evaluateInvoices, delay);
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

function sendWebook(invoice) {
    // console.log(getUserFromEmail(keyUserMap, invoice.customer_email))
    if (getUserFromEmail(keyUserMap, invoice.customer_email) !== "error") {
        var userInfo = "\Name: " + invoice.customer_name + "\n";
        userInfo = userInfo + "Address: " + invoice.customer_address.line1 + "\n";
        userInfo = userInfo + "Address 2: " + invoice.customer_address.line2 + "\n";
        userInfo = userInfo + "City: " + invoice.customer_address.city + "\n";
        userInfo = userInfo + "CAP: " + invoice.customer_address.postal_code + "\n";
        userInfo = userInfo + "State: " + invoice.customer_address.state + "\n";
        userInfo = userInfo + "Country: " + invoice.customer_address.country + "\n";
        userInfo = userInfo + "Cod F.: " + "soon" + "\n";
        return {
            embed: {
                title: invoice.id,
                url: "https://dashboard.stripe.com/invoices/" + invoice.id,
                description: ":coffee: New Paid Invoice :zap:",
                color: 0xf3b670,
                timestamp: new Date().toISOString(),
                footer: {
                    icon_url: "https://i.imgur.com/Vbacrt7.png",
                    text: "Caffeine Invoices"
                },
                author: {
                    name: "Stripe Invoices",
                    icon_url: "https://i.imgur.com/Vbacrt7.png"
                },
                fields: [
                    {
                        name: "Email",
                        value: invoice.customer_email,
                        inline: true
                    },
                    {
                        name: "Discord",
                        value: getUserFromEmail(keyUserMap, invoice.customer_email).name + " (<@" + getUserFromEmail(keyUserMap, invoice.customer_email).id + ">)",
                        inline: true
                    },
                    {
                        name: "Amount Paid",
                        value: parseFloat(invoice.amount_paid) / 100 + " €",
                        inline: true
                    },
                    {
                        name: "Key",
                        value: getUserFromEmail(keyUserMap, invoice.customer_email).key,
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
    else {
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
                description: ":coffee: New Paid Invoice :zap:",
                color: 0xb53737,
                timestamp: new Date().toISOString(),
                footer: {
                    icon_url: "https://i.imgur.com/Vbacrt7.png",
                    text: "Caffeine Invoices"
                },
                author: {
                    name: "Stripe Invoices",
                    icon_url: "https://i.imgur.com/Vbacrt7.png"
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
}