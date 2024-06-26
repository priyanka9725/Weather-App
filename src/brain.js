const apiKey = "4e1f16e5eefd5f9fff7a61ce2643cc39";
const apiBaseUrl = "https://api.openweathermap.org/data/2.5/";
const maxRecentCities = 5;

// event listener function to get city

let getCity = () => {
  const city = document.getElementById("city-input").value.trim();
  if (city) {
    updateWeather(city);
    saveSearch(city);
    showRecentCities();
  } else {
    alert("Please enter a city name");
  }
};

document.getElementById("search-btn").addEventListener("click", getCity);

// event listener function to get the current location

let getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        updateWeatherCord(lat, lon);
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser");
  }
};
document
  .getElementById("current-location-btn")
  .addEventListener("click", getCurrentLocation);

function isDaytime(sunrise, sunset) {
  // checking whether it is day or night
  const now = Math.floor(new Date().getTime() / 1000);
  return now >= sunrise && now < sunset;
}

// async-await function to fetch weather information using entered city name

let getWeather = async function (city) {
  try {
    const response = await fetch(
      `${apiBaseUrl}weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

// function to update weather information and background using entered city

let updateWeather = async function (city) {
  const weatherData = await getWeather(city);
  const forecastData = await getForecastData(city);
  if (weatherData && forecastData) {
    // conditional check if both the data are fetched
    displayWeatherData(weatherData);
    extendedForecast(forecastData);
    const isDay = isDaytime(weatherData.sys.sunrise, weatherData.sys.sunset);
    updateBackground(weatherData.weather[0].main, isDay);
    document.getElementById("city-input").value = "";
  }
};

// async-await function to fetch weather information using current Location

getLatLong = async function (lat, lon) {
  try {
    const response = await fetch(
      `${apiBaseUrl}weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("Location not found");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

//function to update weather information and background using current location

let updateWeatherCord = async function (lat, lon) {
  const weatherData = await getLatLong(lat, lon);
  const forecastData = await getForecastCord(lat, lon);
  if (weatherData && forecastData) {          //checking if both weatherData and forecastData are fetched 
    displayWeatherData(weatherData);
    extendedForecast(forecastData);
    const isDay = isDaytime(weatherData.sys.sunrise, weatherData.sys.sunset);
    updateBackground(weatherData.weather[0].main, isDay);
  }
};

// function for updating background as per the weather condition

let updateBackground = function (weather, isDay) {
  const body = document.body;
  switch (weather.toLowerCase()) {
    case "clear":
      body.className = isDay
        ? "bg-bg-clear-sky bg-cover bg-no-repeat"
        : "bg-bg-night bg-cover bg-no-repeat text-white";
      break;
    case "rain":
    case "light rain":
    case "moderate rain":
    case "heavy intensity rain":
    case "very heavy rain":
    case "extreme rain":
    case "freezing rain":
      body.className = "bg-bg-rainy bg-cover bg-no-repeat";
      break;
    case "snow":
    case "light snow":
    case "heavy snow":
    case "sleet":
    case "shower sleet":
    case "light rain and snow":
    case "rain and snow":
    case "light shower snow":
    case "shower snow":
    case "heavy shower snow":
      body.className = "bg-bg-snowy bg-cover bg-no-repeat";
      break;
    case "clouds":
    case "few clouds":
    case "scattered clouds":
    case "broken clouds":
    case "overcast clouds":
      body.className = "bg-bg-cloudy bg-cover bg-no-repeat";
      break;
    case "thunderstorm":
    case "thunderstorm with light rain":
    case "thunderstorm with rain":
    case "thunderstorm with heavy rain":
    case "light thunderstorm":
    case "heavy thunderstorm":
    case "ragged thunderstorm":
    case "thunderstorm with light drizzle":
    case "thunderstorm with drizzle":
    case "thunderstorm with heavy drizzle":
      body.className = "bg-bg-thunderstorm bg-cover bg-no-repeat";
      break;
    case "drizzle":
    case "light intensity drizzle":
    case "drizzle rain":
    case "heavy intensity drizzle":
    case "light intensity drizzle rain":
    case "drizzle rain":
    case "heavy intensity drizzle rain":
    case "shower drizzle":
      body.className = "bg-bg-drizzle bg-cover bg-no-repeat";
      break;
    case "mist":
    case "smoke":
    case "haze":
    case "sand/ dust whirls":
    case "fog":
    case "sand":
    case "dust":
    case "volcanic ash":
    case "squalls":
    case "tornado":
      body.className = "bg-bg-misty bg-cover bg-no-repeat";
      break;
    default:
      body.className = "bg-bg-default bg-cover bg-no-repeat";
  }
};

// async-await function to forecast weather information using entered city name

let getForecastData = async function (city) {
  try {
    const response = await fetch(
      `${apiBaseUrl}forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

// async-await function to forecast weather information using current location

let getForecastCord = async function (lat, lon) {
  try {
    const response = await fetch(
      `${apiBaseUrl}forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("Location not found");
    const data = await response.json();
    return data;
  } catch (error) {         
    console.error(error);
    alert(error.message);
  }
};

//function to display current weather

function displayWeatherData(data) {
  const container = document.getElementById("weather-container");
  const localTime = getLocalTime(data.timezone);
  const weatherIcon = getWeatherIcon(
    data.weather[0].main,
    isDaytime(data.sys.sunrise, data.sys.sunset)
  );

  container.innerHTML = `
            <div class= " flex justify-between bg-gradient-to-b from-gray-200/[0.4] to-gray-400/[0.4] text-inherit p-4 rounded shadow-[0_0_2rem_-10px_rgba(0,0,0)]">
            <div class="flex flex-col ">
            <h2 class="text-2xl font-bold text-blue-900 my-2">${data.name}, ${data.sys.country}</h2>
            <p class="text-lg font-bold">${localTime}</p>
            <p class="text-lg font-serif font-extrabold capitalize">${data.weather[0].description}</p>
            <p class="text-lg font-semibold"><i class="fa-solid fa-temperature-three-quarters" style="color: #ff5900;"></i> Temperature: ${data.main.temp} °C</p>
            <p class="text-lg font-semibold"><i class="fa-solid fa-arrow-down" style="color:#0091ff;"></i> ${data.main.temp_min} °C <span class="text-lg"><i class="fa-solid fa-arrow-up" style="color:#FFBF00;"></i> ${data.main.temp_max} °C </span></p>
            <p class="text-lg font-semibold"><i class="fa-solid fa-water" style="color: #00FFFF;"></i> Humidity: ${data.main.humidity}%</p>
            <p class="text-lg font-semibold"><i class="fa-solid fa-wind" style="color:#fff08f;"></i> Wind Speed: ${data.wind.speed} m/s</p>
            <p class="text-lg font-semibold"><i class="fa-solid fa-p" style="color:#A020F0;"></i> Pressure: ${data.main.pressure} hPa</p>
            </div>
            <div>
            <i class="${weatherIcon} text-4xl text-amber-500 animate-[float_2s_ease-in-out_infinite]"></i>
            </div>
            </div>
        `;
}

// function for calling the corresponding icons

let getWeatherIcon = function (weather, isDay) {   // these updates the weather icon according to the weather description
  switch (
    weather.toLowerCase() 
  ) {
    case "clear":
      return isDay ? "fas fa-sun" : "fas fa-moon";
    case "clouds":
      return "fas fa-cloud";
    case "rain":
      return "fa-solid fa-cloud-rain";
    case "drizzle":
      return "fas fa-cloud-showers-heavy";
    case "thunderstorm":
      return "fas fa-bolt";
    case "snow":
      return "fas fa-snowflake";
    case "mist":
    case "smoke":
    case "haze":
    case "fog":
    case "sand":
    case "dust":
    case "ash":
    case "squall":
    case "tornado":
      return "fas fa-smog";
    default:
      return "fa-solid fa-cloud-sun";
  }
};

// function for fetching current time

function getLocalTime(timezoneOffset) {
  const now = new Date();
  const localTime = new Date(now.getTime() + timezoneOffset * 1000);
  return localTime.toLocaleString("en-US", { timeZone: "UTC" });  // us timezone as offered  by the API
}

// function to fetch 5-days forecast

let getExtendedForecast = function (forecasts) {
  const dailyForecasts = [];
  let lastDate = null;

  forecasts.forEach((forecast) => {
    const forecastDate = new Date(forecast.dt * 1000).getDate();
    if (forecastDate !== lastDate) {
      dailyForecasts.push(forecast);
      lastDate = forecastDate;
    }
  });
  return dailyForecasts.slice(0, 6);
};

// function to display 5-day forecast

let extendedForecast = function (data) {
  const container = document.getElementById("forecast-container");
  const heading = document.getElementById("heading");
  heading.classList.remove("hidden");
  const dailyForecasts = getExtendedForecast(data.list);

  container.innerHTML = dailyForecasts
    .map((forecast) => {
      const weatherIcon = getWeatherIcon(forecast.weather[0].main, true);
      const forecastDate = new Date(forecast.dt * 1000);
      const dayOfWeek = forecastDate.toLocaleDateString("en-US", {
        weekday: "short",
      });  // for displaying short form of the day names
      return `
        <div class="flex flex-col text-left bg-gradient-to-t from-gray-200/[0.6] to-gray-400/[0.4] p-4 text-inherit rounded shadow-[0_0_2rem_-10px_rgba(0,0,0)]">
          <h3 class="text-xl font-bold text-blue-900 my-2">${dayOfWeek}, ${forecastDate.toLocaleDateString()}</h3>
          <i class="${weatherIcon} text-2xl text-lime-300 animate-[float_2s_ease-in-out_infinite]"></i>
          <p class="text-lg font-serif font-extrabold capitalize"> ${forecast.weather[0].description}</p>
          <p class="text-lg  font-semibold"><i class="fa-solid fa-temperature-three-quarters" style="color: #ff5900;"></i> Temp: ${
            forecast.main.temp
          } °C</p>
                      <p class="text-lg  font-semibold"><i class="fa-solid fa-arrow-down" style="color:#0091ff;"></i> ${
                        forecast.main.temp_min
                      } °C             <span class="text-lg  font-semibold"><i class="fa-solid fa-arrow-up" style="color:#FFBF00;"></i>${
        forecast.main.temp_max
      } °C</span></p>

          <p class="text-lg  font-semibold"><i class="fa-solid fa-water" style="color: #00FFFF;"></i> Humidity: ${
            forecast.main.humidity
          }%</p>
          <p class="text-lg  font-semibold"><i class="fa-solid fa-cloud-rain" style="color:#4000ff;"></i> Rain: ${
            forecast.rain ? forecast.rain["3h"] : 0
          } mm</p>

          <p class="text-lg  font-semibold"><i class="fa-solid fa-wind" style="color:#fff08f;"></i> Wind: ${
            forecast.wind.speed
          } m/s</p>
        </div>
      `;
    })
    .join("");
};

// function for storing recent searches (maximum 5) in the local storage

let saveSearch = function (city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  cities = cities.filter((c) => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);
  if (cities.length > maxRecentCities) {
    cities.pop();
  }
  localStorage.setItem("recentCities", JSON.stringify(cities));
};

// localStorage.clear();

// function for displaying recent searches (maximum 5)

let showRecentCities = function () {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  const recentCitiesContainer = document.getElementById(
    "recent-cities-container"
  );
  if (cities.length > 0) {
    recentCitiesContainer.classList.remove("hidden");
    recentCitiesContainer.innerHTML = cities
      .map(
        (city) =>
          `<button class="recent-city-btn bg-amber-100 text-blue-900 font-semibold p-2 rounded hover:scale-110 transition duration-300">${city}</button>`
      )
      .join("");
    document.querySelectorAll(".recent-city-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        updateWeather(event.target.textContent);
      });
    });
  } else {
    recentCitiesContainer.classList.add("hidden");
  }
};

// to Populate recent cities buttons on page load
document.addEventListener("DOMContentLoaded", showRecentCities);
