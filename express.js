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
    case /^สวัสดี$/.test(eventText):
    case /^hello$/.test(eventText):
    case /^hi$/.test(eventText):
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
      // weather API
      try {
        let textArr = eventText.split(' ');
        let city = textArr.slice(1).join(' ');
        let result = await weather(city);
        msg.text = `query: ${city} => ${result.location.country} ${result.location.name} ${result.location.region} ${result.current.condition.text}`;
      } catch (error) {
        msg.text =
          "Fail to get the weather from your request, Maybe check the city's name";
      }

      break;
    case /info(?= [0-9])/.test(eventText):
    case /ข้อมูลกระถาง(?= [0-9])/.test(eventText):
      try {
        let textArr = eventText.split(' ');
        let bid = parseInt(textArr[1]);

        // Calling info api
        let result = await getBInfo(bid);

        // assign variables
        let board = result.board;
        let weather = result.weather;

        // Generate reply message
        msg = [
          {
            type: 'text',
            text: `Board ${board.BID} Info\nTemperature: ${board.temperature} Humidity: ${board.humidity}\nPressure: ${board.pressure}\nAt: ${board.timestamp}`,
          },
          { type: 'text', text: `${weather.location.name} ${weather.location.region}, ${weather.location.country} is ${weather.current.condition.text}` },
        ];
      } catch (error) {
        console.log(error.data);
        msg.text = 'Fail to get informations, Try checking the given ID';
      }
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
        resolve(response.data);
      })
      .catch((error) => {
        reject(error.data);
      });
  });
}

function getBInfo(bid) {
  return new Promise(async (resolve, reject) => {
    let result = {};

    await axios
      .get(API_URL + '/getLastData/' + bid)
      .then((response) => {
        if (response.data.result) {
          result['board'] = response.data.data;
        } else {
          reject(response.data.msg);
        }
      })
      .catch((error) => {
        result['board'] = null;
      });

    await axios
      .post(API_URL + '/getWeatherByCity', {
        city: result.board.location,
      })
      .then((response) => {
        result['weather'] = response.data;
      })
      .catch((error) => {
        result['weather'] = error.data;
      });

    resolve(result);
  });
}

app.listen(PORT, () => {
  console.log('http://localhost:3000');
});
