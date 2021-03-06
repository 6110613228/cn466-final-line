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
    case /watering/.test(eventText):
    case /รดน้ำ/.test(eventText):
      // watering API
      watering(event);

      // set send flag to false
      send_flag = false;
      break;
    case /weather(?= ([A-Z]|[a-z]))/.test(eventText):
    case /อากาศตอนนี้(?= ([A-Z]|[a-z]))/.test(eventText):
    case /อากาศ(?= ([A-Z]|[a-z]))/.test(eventText):
    case /สภาพอากาศ(?= ([A-Z]|[a-z]))/.test(eventText):
      // weather API
      try {
        // extract params
        let textArr = eventText.split(' ');
        let city = textArr.slice(1).join(' ');

        // call API
        let result = await weather(city);

        pm25 = result.current.air_quality.pm2_5;
        let pm_text;
        if (pm25 > 300) {
          pm_text = "hazardous, don't go outside.";
        } else if (pm25 > 250) {
          pm_text =
            'very unhealthy, please wear an appropriate mask when going outside.';
        } else if (pm25 > 150) {
          pm_text = "unhealthy, don't forget to wear a mask.";
        } else if (pm25 > 100) {
          pm_text = 'moderate according to US AQI.';
        } else {
          pm_text = 'in good condition.';
        }
        // gen message
        msg = [
          {
            type: 'text',
            text: `${result.location.country} ${result.location.name}, ${result.location.region} is ${result.current.condition.text} at ${result.current.last_updated}.`,
          },
          {
            type: 'text',
            text: `It's ${result.current.temp_c}C but feels like ${result.current.feelslike_c}C.`,
          },
          {
            type: 'text',
            text: `PM2.5 index: ${result.current.air_quality.pm2_5} which is, ${pm_text}`,
          },
        ];
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
          {
            type: 'text',
            text: `At board's location: ${weather.location.name} ${weather.location.region}, ${weather.location.country} is ${weather.current.condition.text}`,
          },
        ];
      } catch (error) {
        console.log(error.data);
        msg.text = 'Fail to get informations, Try checking the given ID';
      }
      break;
    case /หยุด(?= [0-9])/.test(eventText):
    case /stop(?= [0-9])/.test(eventText):
      try {
        // extract params
        let textArr = eventText.split(' ');
        let tid = textArr[1];

        // call API
        let result = await stopSchedule(tid);
        if (result.result) {
          msg.text = 'Schedule stopped';
        } else {
          msg.text = 'Fail to stop schedule';
        }
      } catch (error) {
        msg.text = 'Fail to stop schedule';
      }
      break;
    case /เริ่ม(?= [0-9])/.test(eventText):
    case /start(?= [0-9])/.test(eventText):
      try {
        // extract params
        let textArr = eventText.split(' ');
        let tid = textArr[1];

        // call API
        let result = await startSchedule(tid);
        if (result.result) {
          msg.text = 'Schedule started';
        } else {
          msg.text = 'Fail to start schedule';
        }
      } catch (error) {
        msg.text = 'Fail to start schedule';
      }
      break;
    case /^schedule is made on every/.test(eventText):
      send_flag = false;
      break;
  } // End switch case

  if (send_flag) {
    return client.replyMessage(event.replyToken, msg);
  }
}

function watering(event) {
  axios
    .post(API_URL + '/watering', {
      uid: event.source.userId,
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error.message);
    });
}

function weather(city) {
  return new Promise((resolve, reject) => {
    axios
      .post(API_URL + '/getWeather', { q: city })
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
      .post(API_URL + '/getWeather', {
        q: result.board.location,
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

function stopSchedule(tid) {
  return new Promise((resolve, reject) => {
    axios
      .post(API_URL + '/stopSchedule', { schedule_id: tid })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function startSchedule(tid) {
  return new Promise((resolve, reject) => {
    axios
      .post(API_URL + '/startSchedule', { schedule_id: tid })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

app.listen(PORT, () => {
  console.log('http://localhost:3000');
});
