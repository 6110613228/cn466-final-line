const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');

const app = express();

const PORT = process.env.PORT || 3000;

// Serve static LIFF file
app.use(express.static(__dirname + '/vue/dist'));

const API_URL = process.env.API_URL;

const config = {
  channelAccessToken: process.env.CHANNEL_ACC_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

// For webhook
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) => {
    res.json(result);
  });
});

function handleEvent(event) {
  console.log(event);
  if (event.type === 'message' && event.message.type === 'text') {
    handleMessageEvent(event);
  } else {
    return Promise.resolve(null);
  }
}

async function handleMessageEvent(event) {
  let send_flag = true;

  let msg = {
    type: 'text',
    text: "I don't understand.",
  };

  let eventText = event.message.text.toLowerCase();

  switch (true) {
    case /สวัสดี/.test(eventText):
    case /hello/.test(eventText):
    case /hi/.test(eventText):
      msg.text = 'Hello';
      break;
    case /ควรรดน้ำไหม/.test(eventText):
      msg.text = 'ควร';
      break;
    case /watering/.test(eventText):
      // watering API
      watering(event);
      send_flag = false;
      break;
    case /weather(?= ([A-Z]|[a-z]))/.test(eventText):
    case /อากาศตอนนี้(?= ([A-Z]|[a-z]))/.test(eventText):
    case /อากาศ(?= ([A-Z]|[a-z]))/.test(eventText):
    case /สภาพอากาศ(?= ([A-Z]|[a-z]))/.test(eventText):
      let city = eventText.split(' ')[1];
      // weather API
      let result = await weather(city);
      console.log(result);
      result
        .then((result) => {
          msg.text = `${result.location.name} ${result.current.condition.text}`;
        })
        .catch((error) => {
          console.log(error.message);
        });
      break;
  }

  if (send_flag) {
    return client.replyMessage(event.replyToken, msg);
  }
}

function watering(event) {
  axios.get(API_URL + '/watering').then((response) => {
    if (response.data.result == true) {
      return true;
    }
    return false;
  });
}

function weather(city) {
  return new Promise((resolve, reject) => {
    axios
      .post(API_URL + '/getWeatherByCity', { city: city })
      .then((response) => {
        return resolve(response.data);
      })
      .catch((error) => {
        return reject(error);
      });
  });
}

app.listen(PORT, () => {
  console.log('http://localhost:3000');
});
