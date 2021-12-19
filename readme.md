![1](https://user-images.githubusercontent.com/61135042/146673161-fb729d2f-79df-439e-9743-281dbff81c8a.png)

# CN466-final-API

## Other work

### [API](https://github.com/6110613228/cn466-final-api)

### [Model (TensorflowJS)](https://github.com/6110613228/cn466-final-model)

### [MQTT (Arduino)](https://github.com/6110613228/cn466-final-mqtt)

---

## Table of contents

- [CN466-final-API](#cn466-final-api)
  - [Other work](#other-work)
    - [API](#api)
    - [Model (TensorflowJS)](#model-tensorflowjs)
    - [MQTT (Arduino)](#mqtt-arduino)
  - [Table of contents](#table-of-contents)
  - [Line & LIFF](#line--liff)
    - [หน้าที่](#หน้าที่)
    - [การทำงาน](#การทำงาน)
    - [Chatbot](#chatbot)
      - [All dialog](#all-dialog)
    - [LIFF](#liff)
      - [vuejs + onsen](#vuejs--onsen)
      - [Schedule watering](#schedule-watering)
      - [Should I Water](#should-i-water)
  - [Demo](#demo)

---

## Line & LIFF

### หน้าที่

Chatbot เเละ Line LIFF ทำหน้าที่เป็น user interface ที่ผู้ใชสามารถเข้ามา interact กับ application ของเราได้โดยเราจะใช้ Line messaging API (Webhook), LIFF, Axios ในการยิง request ไปที่ API server ของเราเเละรับ response กลับมาเพื่อเเสดงให้ผู้ใช้ได้ทราบ

### การทำงาน

ใช้ Express เพื่อ serve static file ให้กับ Liff เเละใช้ `@line/bot-sdk` เพื่อใช้ Line messaging API ในการสกัดข้อมูลจากข้อความที่ผู้ใช้ส่งมาเเละทำการส่ง request ไปให้กับ API server

### Chatbot

#### All dialog

1. สวัสดี, hello, hi
    - Hello
2. รดน้ำ, watering
    - Call watering api
3. (weather, อากาศตอนนี้, อากาศ, สภาพอากาศ) [city|lat,long]
    - Call weather api
4.  (ข้อมูลกระถาง, info) [0-9]
    - Get board info and it's location weather
5.  (หยุด, stop) [Task ID]
    - stop schedule
6.  เริ่ม, start
    - start schedule

### LIFF

#### vuejs + onsen

onsen สามารถใช้ vuejs ซึ่งเป็น javascript front end framework ทำให้สามารถพัฒนาตัว UI ได้สะดวกเเละง่ายมากขึ้น [link](https://onsen.io/v2/api/vue/)

`vue build` เพื่อ generate dist เเละให้ express serve static ที่ /dist

#### Schedule watering

ในส่วนของการ Schedule ใช้ node-cron ซึ่ง syntax จะถูก generate โดย javascript ที่เขียนใน vue เเละทำการส่งไปให้ API server

#### Should I Water

Should I Water จะขอ Geolocation เพื่อนำพิกัด Latitude, Longtitude ของ user มาใช้ในการ forecast weather เเละส่งรูปเพื่อใช้ในการ predict Sky condition

---

## Demo
