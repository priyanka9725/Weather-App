const apiKey = "4e1f16e5eefd5f9fff7a61ce2643cc39";
const apiBaseUrl = "https://api.openweathermap.org/data/2.5/";
const maxRecentCities = 5;

let getCity = () => {
  const city = document.getElementById("city-input").value;
  if (city) {
    updateWeatherByCity(city);
    saveCity(city);
    populateRecentCities();
  } else {
    alert("Please enter a city name");
  }
};

document.getElementById("search-btn").addEventListener("click", getCity);

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
  const now = Math.floor(new Date().getTime() / 1000); // Current time in seconds
  return now >= sunrise && now < sunset;
}

function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  cities = cities.filter((c) => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);
  if (cities.length > maxRecentCities) {
    cities.pop();
  }
  localStorage.setItem("recentCities", JSON.stringify(cities));
}

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
          `<button class="recent-city-btn bg-blue-200 text-blue-800 p-2 rounded">${city}</button>`
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

function displayCurrentWeather(data) {
  const container = document.getElementById("weather-container");

  const localTime = getLocalTime(data.timezone);

  container.innerHTML = `
        <div id="displayWeather" class="bg-white p-4 rounded shadow">
            <h2 class="text-2xl font-bold">${data.name}, ${data.sys.country}</h2>
            <p class="text-lg">${data.weather[0].description}</p>
            <p class="text-lg">Temperature: ${data.main.temp} °C</p>
            <p class="text-lg">Humidity: ${data.main.humidity}%</p>
            <p class="text-lg">Wind Speed: ${data.wind.speed} m/s</p>
        </div>
    `;

  const localTimeContainer = document.getElementById("local-time");
  localTimeContainer.innerHTML = `
        <h3 class="text-xl font-bold">Local Time</h3>
        <p>${localTime}</p>
    `;
}
function getLocalTime(timezoneOffset) {
  const now = new Date();
  const localTime = new Date(now.getTime() + timezoneOffset * 1000);
  return localTime.toLocaleString("en-US", { timeZone: "UTC" });
}

function displayForecast(data) {
  const container = document.getElementById("forecast-container");
  const dailyForecasts = getDailyForecasts(data.list);

  container.innerHTML = dailyForecasts
    .map((forecast) => {
      return `
        <div id="forecast" class="bg-white bg-cover bg-no-repeat p-4 rounded shadow">
          <h3 class="text-xl font-bold">${new Date(
            forecast.dt * 1000
          ).toLocaleDateString()}</h3>
          <p class="text-lg">${forecast.weather[0].description}</p>
          <p class="text-lg">Temp: ${forecast.main.temp} °C</p>
          <p class="text-lg">Humidity: ${forecast.main.humidity}%</p>
          <p class="text-lg">Wind: ${forecast.wind.speed} m/s</p>
        </div>
      `;
    })
    .join("");
}

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

  return dailyForecasts.slice(0, 5);
}

function updateBackground(weather, isDay) {
  const body = document.body;
  switch (weather.toLowerCase()) {
    case "clear":
      body.className = isDay
        ? "bg-bg-clear-sky bg-cover bg-no-repeat"
        : "bg-bg-night bg-cover bg-no-repeat";
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
    case "few clouds": // 11-25%
    case "scattered clouds": // 25-50%
    case "broken clouds": // 51-84%
    case "overcast clouds": // 85-100%
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

// Populate recent cities buttons on page load
document.addEventListener("DOMContentLoaded", populateRecentCities);
