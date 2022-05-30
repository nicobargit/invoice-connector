const Discord = require('discord.js');

const client = new Discord.Client();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
// client.on('debug', console.log);

module.exports = {
    sendWebhook: function (invoice, channel_id, embed_configs) {
        client.channels.cache.get(channel_id).send(getWebhook(invoice, embed_configs));
    },
    start: function (auth_key) {
        client.login(auth_key);
    },
    stop: function () {
        clearInterval(interval)
    }
};

function getWebhook(invoice, embed_configs) {
    let userInfo = "\Name: " + invoice.first_name + " " + invoice.last_name + "\n";
    userInfo = userInfo + "Address: " + invoice.address_1 + "\n";
    userInfo = userInfo + "Address 2: " + invoice.address_2 + "\n";
    userInfo = userInfo + "City: " + invoice.city + "\n";
    userInfo = userInfo + "CAP: " + invoice.postal_code + "\n";
    userInfo = userInfo + "State: " + invoice.state + "\n";
    userInfo = userInfo + "Country: " + invoice.country + "\n";
    userInfo = userInfo + "Cod F.: " + invoice.cod_f + "\n";
    let description;
    let color;

    console.log(invoice.status)
    switch (invoice.status) {
        case "sent":
            description = "**New Paid SENT Invoice!**";
            color = 0x08f26e;
            break;
        case "ready":
            description = "**New Paid Invoice!**";
            color = 0x08f26e;
            break;
        case "missing_cf":
            description = "**MISSING CF!**";
            color = 0xFFA500;
            break;
        case "error_email":
            description = "**Error Invoice Email mismatch!**";
            color = 0xb53737;
            break;
        default:
            description = "**IDK!**";
            color = 0;
            break;
    }

    return {
        embed: {
            title: invoice.id,
            url: "https://dashboard.stripe.com/invoices/" + invoice.id,
            description: description,
            color: color,
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
                    value: invoice.email,
                    inline: true
                },
                {
                    name: "Discord",
                    value: invoice.discord_name + " (<@" + invoice.discord_id + ">)",
                    inline: true
                },
                {
                    name: "Amount Paid",
                    value: parseFloat(invoice.amount_paid) / 100 + " €",
                    inline: true
                },
                {
                    name: "Key",
                    value: invoice.key,
                    inline: true
                },
                {
                    name: "Invoice PDF",
                    value: "[Link](" + invoice.pdf + ")",
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