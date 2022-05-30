var stripe;
var interval;

var paidInvoicesCatalog = [];
var newPaidInvoices = []

module.exports = {
    getNewPaidInvoices: function () {
        let tmp = newPaidInvoices
        newPaidInvoices = []
        return tmp
    },
    start: function (auth_key, delay) {
        stripe = require('stripe')(auth_key);
        // startFromCheckpoint but atm start from the current status
        // stripe.invoices.list({ limit: 100 }).then(r => {
        //     paidInvoicesCatalog = r.data.filter(i => i.status === 'paid');
        // });
        // console.log("Invoices downloaded at " + new Date().toISOString());
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