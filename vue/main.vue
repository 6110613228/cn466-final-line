<template>
  <v-ons-page class="main">
    <v-ons-toolbar>
      <div class="left">
        <ons-toolbar-button @click="carouselIndex > 0 && carouselIndex--"
          >Back</ons-toolbar-button
        >
      </div>
      <div class="center">LIFF</div>
      <div class="right">
        <ons-toolbar-button @click="carouselIndex < 2 && carouselIndex++"
          >Next</ons-toolbar-button
        >
      </div>
    </v-ons-toolbar>

    <v-ons-carousel
      fullscreen
      swipeable
      auto-scroll
      overscrollable
      :index.sync="carouselIndex"
    >
      <v-ons-carousel-item :style="{ backgroundColor: carousel[0].BLUE }">
        <div style="text-align: center; font-size: 20px; color: #fff">
          <v-ons-row>
            <v-ons-col>
              <h1>Schedule Watering</h1>
            </v-ons-col>
          </v-ons-row>
          <v-ons-row class="mx-16">
            <v-ons-col>
              <h3 class="text-left">Choose time of the day</h3>
              <v-ons-list style="width: 50%">
                <v-ons-list-item>
                  <div class="center">
                    <v-ons-select v-model="selectedTime">
                      <option
                        v-for="time in times"
                        :key="time.value"
                        :value="time.value"
                      >
                        {{ time.text }}
                      </option>
                    </v-ons-select>
                  </div>
                </v-ons-list-item>
              </v-ons-list>
            </v-ons-col>
          </v-ons-row>
          <v-ons-row class="mx-16">
            <v-ons-col width="91%">
              <h3 class="text-left">Choose days</h3>
              <v-ons-list class="checklist">
                <v-ons-list-item
                  v-for="(day, $index) in days"
                  :key="day"
                  tappable
                >
                  <label class="left">
                    <v-ons-checkbox
                      :input-id="'checkbox-' + $index"
                      :value="day"
                      v-model="chooesDay"
                    >
                    </v-ons-checkbox>
                  </label>
                  <label class="center" :for="'checkbox-' + $index">
                    {{ day }}
                  </label>
                </v-ons-list-item>
              </v-ons-list>
            </v-ons-col>
          </v-ons-row>
          <v-ons-row class="mx-16">
            <v-ons-col class="text-left">
              <v-ons-button
                modifier="cta"
                style="margin: 16px 0"
                @click="schedule()"
                >Schedule</v-ons-button
              >
            </v-ons-col>
          </v-ons-row>
        </div>
      </v-ons-carousel-item>
      <v-ons-carousel-item :style="{ backgroundColor: carousel[1].DARK }">
        <div style="text-align: center; font-size: 20px; color: #fff">
          <v-ons-row>
            <v-ons-col>
              <h1>Should I water my plant</h1>
            </v-ons-col>
          </v-ons-row>
          <v-ons-row class="mx-16">
            <v-ons-col>
              <h3 class="text-left">Where</h3>
            </v-ons-col>
          </v-ons-row>
          <v-ons-row class="mx-16">
            <v-ons-col>
              <v-ons-input
                v-model="q"
                placeholder="Input your city or latitude, longtitude"
                class="input"
                input-id="q"
                float
              ></v-ons-input>
            </v-ons-col>
            <v-ons-col width="100px">
              <v-ons-button
                ><v-ons-icon
                  icon="md-gps-dot"
                  size="20px"
                  @click="getMyLocation()"
                ></v-ons-icon
              ></v-ons-button>
            </v-ons-col>
          </v-ons-row>
          <v-ons-row class="mx-16">
            <v-ons-col class="text-left">
              <h3>Sky image</h3>
              <input
                id="image"
                type="file"
                accept="image/*"
                capture="environment"
              />
            </v-ons-col>
          </v-ons-row>
          <v-ons-row class="mx-16">
            <v-ons-col class="text-left">
              <h3>Board ID</h3>
              <v-ons-input
                v-model="bid"
                placeholder="Input your Board ID"
                class="input"
                input-id="q"
                float
              ></v-ons-input>
            </v-ons-col>
          </v-ons-row>
          <v-ons-row class="mx-16">
            <v-ons-col class="text-left">
              <v-ons-button
                modifier="cta"
                style="margin: 16px 0"
                @click="shouldIWater()"
                >Should I water</v-ons-button
              >
            </v-ons-col>
          </v-ons-row>
        </div>
      </v-ons-carousel-item>
    </v-ons-carousel>
    <div :style="dots">
      <span
        :index="dotIndex - 1"
        v-for="dotIndex in carousel.length"
        :key="dotIndex"
        style="cursor: pointer"
        @click="carouselIndex = dotIndex - 1"
      >
        {{ carouselIndex === dotIndex - 1 ? "\u25CF" : "\u25CB" }}
      </span>
    </div>
  </v-ons-page>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      reader: null,

      liffID: "1656714349-b34j0Gp2",

      carouselIndex: 0,
      carousel: [{ BLUE: "#085078" }, { DARK: "#373B44" }],
      dots: {
        textAlign: "center",
        fontSize: "30px",
        color: "#fff",
        position: "absolute",
        bottom: "40px",
        left: 0,
        right: 0,
      },
      times: [
        { text: "Morning (08:30)", value: "30 8" },
        { text: "Noon (12:30)", value: "30 12" },
        { text: "Evening (18:30)", value: "30 18" },
      ],
      selectedTime: "30 8",

      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      chooesDay: [],

      // Should water
      q: "",
      image: "",
      bid: "",
    };
  },
  methods: {
    schedule() {
      let schedule = this.scheduleFormatted();
      axios
        .post("https://cn466-final-api.herokuapp.com/schedule", {
          schedule: schedule,
        })
        .then((res) => {
          if (res.data.result) {
            // Generate msg
            let msg = `${res.data.msg} on every '${this.chooesDay.join(
              ", "
            )}', ${this.getScheduleText()} with Task ID: ${res.data.task_id}`;

            // Notification
            this.$ons.notification.alert(msg);

            // Push message to Chat using LIFF
            this.$liff
              .sendMessages([{ type: "text", text: msg }])
              .catch((error) => {
                console.log(error.message);
              });
          } else {
            let msg = `${res.data.msg}`;
            this.$ons.notification.alert(msg);
            this.$liff
              .sendMessages([{ type: "text", text: msg }])
              .catch((error) => {
                console.log(error.message);
              });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getMyLocation() {
      if ("geolocation" in navigator) {
        /* geolocation is available */
        navigator.geolocation.getCurrentPosition((position) => {
          this.q = `${Math.round(position.coords.latitude * 100) / 100},${
            Math.round(position.coords.longitude * 100) / 100
          }`;
        });
      } else {
        /* geolocation IS NOT available */
        this.$ons.notification.alert("Your device don't support Geolocation");
      }
    },
    scheduleFormatted() {
      return `${this.selectedTime} * * ${this.chooesDay.join(",")}`;
    },
    getScheduleText() {
      let result = "";
      this.times.forEach((element) => {
        if (element.value == this.selectedTime) {
          result = element.text;
        }
      });
      return result;
    },
    shouldIWater() {
      // Check of image, q is empty
      axios
        .post("https://cn466-final-api.herokuapp.com/shouldIWater", {
          q: this.q,
          image: this.image,
          bid: parseInt(this.bid),
        })
        .then((response) => {
          console.log(response.data);
          this.$ons.notification.alert(response.data.msg);
        })
        .catch((error) => {
          console.log(error.message);
          this.$ons.notification.alert(error.message);
        });
    },
  },
  created() {
    this.$liff
      .init({ liffId: this.liffID })
      .then(() => {
        console.log("init");
        if (this.$liff.isLoggedIn()) {
          console.log("Logged in");
        } else {
          console.log("out");
        }
      })
      .catch((error) => {
        console.error(error.code, error.message);
      });
  },
  mounted() {
    this.reader = new FileReader();
    this.reader.onloadend = () => {
      const base64String = this.reader.result
        .replace("data:", "")
        .replace(/^.+,/, "");

      // log to console
      // logs wL2dvYWwgbW9yZ...
      this.image = base64String;
    };

    document.getElementById("image").addEventListener("change", (event) => {
      const fileList = event.target.files;
      this.reader.readAsDataURL(fileList[0]);
    });
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Display:wght@300&display=swap");

.text-left {
  text-align: left;
}

.mx-16 {
  margin-left: 16px;
  margin-right: 16px;
}

.checklist {
  font-size: 12px;
}

.main {
  font-family: "Noto Sans Display", sans-serif;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.input {
  width: 100%;
}

#q {
  color: white;
}

.m0 {
  margin: 0 0 0 0;
}
</style>
