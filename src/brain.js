const apiKey = "4e1f16e5eefd5f9fff7a61ce2643cc39";
const apiBaseUrl = "https://api.openweathermap.org/data/2.5/";
const maxRecentCities = 5;

//function to get city

let getCity = () => {
  const city = document.getElementById("city-input").value.trim();
  if (city) {
    updateWeatherByCity(city);
    saveCity(city);
    populateRecentCities();
  } else {
    alert("Please enter a city name");
  }
};

document.getElementById("search-btn").addEventListener("click", getCity);

// function to get the current location

let getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        updateWeatherByCoordinates(lat, lon);
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

// function for storing recent searches (maximum 5) in the local storage

function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  cities = cities.filter((c) => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);
  if (cities.length > maxRecentCities) {
    cities.pop();
  }
  localStorage.setItem("recentCities", JSON.stringify(cities));
}

// localStorage.clear();

// function for displaying recent searches (maximum 5)

function populateRecentCities() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  const recentCitiesContainer = document.getElementById(
    "recent-cities-container"
  );
  if (cities.length > 0) {
    recentCitiesContainer.classList.remove("hidden");
    recentCitiesContainer.innerHTML = cities
      .map(
        (city) =>
          `<button class="recent-city-btn bg-amber-100 text-blue-900 font-semibold p-2 rounded">${city}</button>`
      )
      .join("");
    document.querySelectorAll(".recent-city-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        updateWeatherByCity(event.target.textContent);
      });
    });
  } else {
    recentCitiesContainer.classList.add("hidden");
  }
}

// async-await function to fetch weather information using entered city name

async function fetchWeatherByCity(city) {
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
}

// async-await function to fetch weather information using current Location

async function fetchWeatherByCoordinates(lat, lon) {
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
}

// async-await function to forecast weather information using entered city name

async function fetchForecastByCity(city) {
  try {
    const response = await fetch(
      `${apiBaseUrl}forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// async-await function to forecast weather information using current location

async function fetchForecastByCoordinates(lat, lon) {
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
}

// function to update weather information using entered city

async function updateWeatherByCity(city) {
  const weatherData = await fetchWeatherByCity(city);
  const forecastData = await fetchForecastByCity(city);
  if (weatherData && forecastData) {
    displayCurrentWeather(weatherData);
    displayForecast(forecastData);
    const isDay = isDaytime(weatherData.sys.sunrise, weatherData.sys.sunset);
    updateBackground(weatherData.weather[0].main, isDay);
    document.getElementById("city-input").value = "";
  }
}

//function to update weather information using current location

async function updateWeatherByCoordinates(lat, lon) {
  const weatherData = await fetchWeatherByCoordinates(lat, lon);
  const forecastData = await fetchForecastByCoordinates(lat, lon);
  if (weatherData && forecastData) {
    displayCurrentWeather(weatherData);
    displayForecast(forecastData);
    const isDay = isDaytime(weatherData.sys.sunrise, weatherData.sys.sunset);
    updateBackground(weatherData.weather[0].main, isDay);
  }
}

//function to display current weather

function displayCurrentWeather(data) {
  const container = document.getElementById("weather-container");

  const localTime = getLocalTime(data.timezone);
  const weatherIcon = getWeatherIcon(
    data.weather[0].main,
    isDaytime(data.sys.sunrise, data.sys.sunset)
  );

  container.innerHTML = `
            <div class= " flex justify-between bg-gray-200 hover:bg-gradient-to-r from-gray-300/[0.5] to-blue-100 text-black p-4 rounded shadow-lg">
            <div class="flex flex-col ">
            <h2 class="text-2xl font-bold text-blue-900 my-2">${data.name}, ${data.sys.country}</h2>
            <p class="text-lg font-semibold"> ${data.weather[0].description}</p>
            <p class="text-lg">Temperature: ${data.main.temp} °C</p>
            <p class="text-lg">Humidity: ${data.main.humidity}%</p>
            <p class="text-lg">Wind Speed: ${data.wind.speed} m/s</p>
            </div>
            <div>
            <i class="${weatherIcon} text-4xl"></i>
            </div>
            </div>

        `;

  //for displaying current time

  const localTimeContainer = document.getElementById("local-time");
  localTimeContainer.classList.remove("hidden"); //
  localTimeContainer.innerHTML = `
        <h3 class="text-xl font-bold">Local Time</h3>
        <p>${localTime}</p>
    `;
}

function getWeatherIcon(weather, isDay) {
  switch (weather.toLowerCase()) {
    case "clear":
      return isDay ? "fas fa-sun" : "fas fa-moon";
    case "clouds":
      return "fas fa-cloud";
    case "rain":
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
      return "fas fa-cloud";
  }
}

// function for fetching current time

function getLocalTime(timezoneOffset) {
  const now = new Date();
  const localTime = new Date(now.getTime() + timezoneOffset * 1000);
  return localTime.toLocaleString("en-US", { timeZone: "UTC" });
}

// function to display 7-day forecast

function displayForecast(data) {
  const container = document.getElementById("forecast-container");
  const heading = document.getElementById("heading");
  heading.classList.remove("hidden");
  const dailyForecasts = getDailyForecasts(data.list);

  container.innerHTML = dailyForecasts
    .map((forecast) => {
      const weatherIcon = getWeatherIcon(forecast.weather[0].main, true);
      return `
        <div class="flex flex-col items-center bg-gray-200 hover:bg-gradient-to-r from-gray-300/[0.5] to-blue-100 p-4 text-black rounded shadow">
          <h3 class="text-xl font-bold text-blue-900 my-2">${new Date(
            forecast.dt * 1000
          ).toLocaleDateString()}</h3>
          <i class="${weatherIcon} text-2xl"></i>
          <p class="text-lg font-semibold"> ${
            forecast.weather[0].description
          }</p>
          <p class="text-lg">Temp: ${forecast.main.temp} °C</p>
          <p class="text-lg">Humidity: ${forecast.main.humidity}%</p>
          <p class="text-lg">Wind: ${forecast.wind.speed} m/s</p>
        </div>
      `;
    })
    .join("");
}

// function to fetch 5-day forecast

function getDailyForecasts(forecasts) {
  const dailyForecasts = [];
  let lastDate = null;

  forecasts.forEach((forecast) => {
    const forecastDate = new Date(forecast.dt * 1000).getDate();
    if (forecastDate !== lastDate) {
      dailyForecasts.push(forecast);
      lastDate = forecastDate;
    }
  });

  return dailyForecasts.slice(0, 7);
}

// function for updating background as per the weather condition

function updateBackground(weather, isDay) {
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
}

// to Populate recent cities buttons on page load
document.addEventListener("DOMContentLoaded", populateRecentCities);
