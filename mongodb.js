const MongoClient = require('mongodb').MongoClient;
var customer_fiscal_codes = [];
var dbo;
var interval;

module.exports = {
    getFiscalCodes: function () {
        return customer_fiscal_codes;
    },
    getFiscalCodeFromKey: function (key) {
        var res;
        for (var i = 0; i < customer_fiscal_codes.length; i++) {
            if(customer_fiscal_codes[i].key === key) {
                res = cf
            }
        }
        return res
    },
    start: function (mongoUrl, delay) {

        MongoClient.connect(mongoUrl, function (err, db) {
            if (err) throw err;
            dbo = db.db("caffeine_logs");
            console.log("Connected to Caffeine MongoDB database");
         
            dbo.collection("customers_cfs").find({}).toArray(function (err, result) {
               if (err) throw err;
               customer_fiscal_codes = result;
            });
        });
        interval = setInterval(function () {
            dbo.collection("customers_cfs").find({}).toArray(function (err, result) {
               if (err) throw err;
               customer_fiscal_codes = result;
               console.log("Updated customers CFs")
            });
        }, delay);
    },
    stop: function () {
        clearInterval(interval)
    },
    update: function () {
        evaluateInvoices()
    }
};