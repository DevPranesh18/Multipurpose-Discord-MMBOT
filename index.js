const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let data = {};

client.on("ready", () => {
  console.log("Jinx MM Running");
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  if (message.content === "!mm") {
    message.channel.send("Mention sender");
    data.step = "sender";
    return;
  }

  if (data.step === "sender") {
    const sender = message.mentions.users.first();
    if (!sender) return;

    data.sender = sender.id;
    data.step = "receiver";

    message.channel.send("Mention receiver");
    return;
  }

  if (data.step === "receiver") {
    const receiver = message.mentions.users.first();
    if (!receiver) return;

    data.receiver = receiver.id;
    data.step = "item";

    message.channel.send(`<@${receiver.id}> send item text`);
    return;
  }

  if (data.step === "item" && message.author.id === data.receiver) {
    data.item = message.content;
    data.step = "crypto";

    message.channel.send("Type BTC / USDT / LTC");
    return;
  }

  if (data.step === "crypto") {
    data.crypto = message.content.toUpperCase();
    data.step = "amount";

    message.channel.send("Enter amount in $");
    return;
  }

  if (data.step === "amount") {
    data.amount = message.content;
    data.step = "waiting";

    let address;

    if (data.crypto === "BTC") address = config.btc;
    if (data.crypto === "USDT") address = config.usdt;
    if (data.crypto === "LTC") address = config.ltc;

    message.channel.send(`
Jinx MM Receipt

Sender: <@${data.sender}>
Receiver: <@${data.receiver}>
Crypto: ${data.crypto}
Amount: $${data.amount}

Address: ${address}

Type !paid after payment
`);
    return;
  }

  if (message.content === "!paid") {
    message.channel.send("Waiting for Jinx MM confirmation");
  }

  if (message.content === "!confirm") {

    if (message.author.id !== config.owner) return;

    message.channel.send(`
Payment Confirmed

Item released to <@${data.sender}>

Item:
${data.item}
`);
  }

});

client.login(config.token);
