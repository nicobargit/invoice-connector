const axios = require("axios");

var interval;
var instance;
var dashboardKeys = []
var userKeyData = {}

module.exports = {
    getUsers: function () {
        return userKeyData
    },
    start: function (auth_key, delay) {
        instance = axios.create({
            timeout: 10000,
            headers: { 'Authorization': 'Bearer ' + auth_key, 'Content-type': 'application/json' }
        });
        startUpdateLicenses();
        interval = setInterval(startUpdateLicenses, delay);
    },
    stop: function () {
        clearInterval(interval)
    },
    update: function () {
        startUpdateLicenses()
    },
    getFromKey: function (key) {
        return userKeyData[key]
    },
    getFromEmail: function (email) {
        var res = undefined;
        for (var i = 0; i < Object.keys(userKeyData).length; i++) {
            if (userKeyData[Object.keys(userKeyData)[i]].email === email) {
                res = userKeyData[Object.keys(userKeyData)[i]];
            }
        }
        return res;
    }
};

function updateLicenses(pageNumber, keyList, map) {
    instance.get("https://api.whop.io/api/v1/licenses?page=" + pageNumber)
        .then(resp => {
            resp.data.users.forEach(d => {
                map[d.key] = {
                    id: d.discord.discord_account_id,
                    name: d.discord.username,
                    email: d.email,
                    key: d.key
                };
                keyList.push(d.key);
            });
            if (resp.data.page < resp.data.total_pages) {
                updateLicenses(pageNumber + 1, keyList, map);
            }
            else {
                console.log("Successfully downloaded licenses from " + pageNumber + " pages");
                dashboardKeys = keyList;
                userKeyData = map;
            }
        })
        .catch(error => {
            console.log(error);
            startUpdateLicenses();
        });
}

function startUpdateLicenses() {
    console.log("Updating licenses");
    updateLicenses(1, [], {});
}