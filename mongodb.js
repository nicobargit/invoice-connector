const MongoClient = require('mongodb').MongoClient;
var customer_fiscal_codes = [];
var dbo;
var interval;

module.exports = {
    getFiscalCodes: function () {
        return customer_fiscal_codes;
    },
    getFiscalCodeFromKey: function (key) {
        var res = undefined;
        for (var i = 0; i < customer_fiscal_codes.length; i++) {
            if (customer_fiscal_codes[i].key === key) {
                res = customer_fiscal_codes[i]
            }
        }
        return res
    },
    checkStoredInvoiceStatus: async function (invoice_id) {
        var res = await dbo.collection("invoices").find({ id: invoice_id })
        var arr = await res.toArray()
        if (arr.length > 0) {
            // console.log("MONGOOOO")
            // console.log(arr)
            return arr[0].status;
        }
        else {
            return "not_found";
        }
    },
    addOrReplaceInvoice: function (invoice_data, status) {
        dbo.collection("invoices").replaceOne({ key: invoice_data.id }, invoice_data, { upsert: true }, function (err, res) {
            if (err) throw err;
            console.log("Add " + invoice_data.id + " to MongoDB database");
        });
    },
    start: function (mongoUrl, delay) {
        MongoClient.connect(mongoUrl, function (err, db) {
            if (err) throw err;
            dbo = db.db("caffeine_logs");
            console.log("Connected to Caffeine MongoDB database");

            dbo.collection("customers_cfs").find({}).toArray(function (err, result) {
                if (err) throw err;
                customer_fiscal_codes = result;
                console.log("Downloaded customers CFs")
            });
        });
        interval = setInterval(function () {
            try {
                dbo.collection("customers_cfs").find({}).toArray(function (err, result) {
                    if (!err) {
                        customer_fiscal_codes = result;
                        console.log("Updated customers CFs")
                    }
                });
            }
            catch (e) {
                console.log(e)
            }
        }, delay);
    },
    stop: function () {
        clearInterval(interval)
    }
};