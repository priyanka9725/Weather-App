const apiKey = "4e1f16e5eefd5f9fff7a61ce2643cc39";
const apiBaseUrl = "https://api.openweathermap.org/data/2.5/";
const maxRecentCities = 5;

document.getElementById("search-btn").addEventListener("click", () => {
  const city = document.getElementById("city-input").value;
  if (city) {
    updateWeatherByCity(city);
    saveCity(city);
    populateRecentCities();
  } else {
    alert("Please enter a city name");
  }
});

document
  .getElementById("current-location-btn")
  .addEventListener("click", () => {
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
  });

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
    updateBackground(weatherData.weather[0].main);
    document.getElementById("city-input").value = ""
  }
}

async function updateWeatherByCoordinates(lat, lon) {
  const weatherData = await fetchWeatherByCoordinates(lat, lon);
  const forecastData = await fetchForecastByCoordinates(lat, lon);
  if (weatherData && forecastData) {
    displayCurrentWeather(weatherData);
    displayForecast(forecastData);
    updateBackground(weatherData.weather[0].main);
  }
}

function displayCurrentWeather(data) {
  const container = document.getElementById("weather-container");
  container.innerHTML = `
        <div class="bg-white p-4 rounded shadow">
            <h2 class="text-2xl font-bold">${data.name}, ${data.sys.country}</h2>
            <p class="text-lg">${data.weather[0].description}</p>
            <p class="text-lg">Temperature: ${data.main.temp} °C</p>
            <p class="text-lg">Humidity: ${data.main.humidity}%</p>
            <p class="text-lg">Wind Speed: ${data.wind.speed} m/s</p>
        </div>
    `;
}

function displayForecast(data) {
  const container = document.getElementById("forecast-container");
  const dailyForecasts = getDailyForecasts(data.list);

  container.innerHTML = dailyForecasts
    .map((forecast) => {
      return `
            <div class="bg-white p-4 rounded shadow">
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

function updateBackground(weather) {
  const body = document.body;
  switch (weather.toLowerCase()) {
    case "clear":
      body.className = "bg-clear-sky";
      break;
    case "rain":
      body.className = "bg-rainy";
      break;
    case "snow":
      body.className = "bg-snowy";
      break;
    case "clouds":
      body.className = "bg-cloudy";
      break;
    case "wind":
      body.className = "bg-windy";
      break;
    case "night":
      body.className = "bg-night";
      break;
    default:
      body.className = "bg-gray-100";
  }
}

// Populate recent cities buttons on page load
document.addEventListener("DOMContentLoaded", populateRecentCities);
