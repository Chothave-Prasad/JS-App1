const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const searchForm = document.querySelector("[data-searchForm]");
const searchInput = document.querySelector("[data-searchInput]");
const grantAccessContainer = document.querySelector(".grant-location-container");
const userInfoContainer = document.querySelector(".user-info-container");
const loadingScreen = document.querySelector(".loading-container");
const grantAccessBtn = document.querySelector("[data-grantAccess]");

const cityName = document.querySelector("[data-cityName]");
const countryIcon = document.querySelector("[data-countryIcon]");
const weatherDesc = document.querySelector("[data-weatherDesc]");
const weatherIcon = document.querySelector("[data-weatherIcon]");
const temp = document.querySelector("[data-temp]");
const windspeed = document.querySelector("[data-windspeed]");
const humidity = document.querySelector("[data-humidity]");
const cloud = document.querySelector("[data-cloud]");

const API_KEY = "51ad86a0b2b7a892ab5d905d7df7b3e1";

let currentTab = userTab;
currentTab.classList.add("current-tab");

getFromSessionStorage();

/* ---------------- TAB SWITCHING ---------------- */
function switchTab(clickedTab) {
    if (clickedTab !== currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        userInfoContainer.classList.remove("active");
        loadingScreen.classList.remove("active");

        if (currentTab === searchTab) {
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            searchForm.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

/* ---------------- SESSION STORAGE ---------------- */
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

/* ---------------- LOCATION ---------------- */
grantAccessBtn.addEventListener("click", getLocation);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation not supported");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    sessionStorage.setItem(
        "user-coordinates",
        JSON.stringify(userCoordinates)
    );

    fetchUserWeatherInfo(userCoordinates);
}

/* ---------------- FETCH WEATHER (LOCATION) ---------------- */
async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        loadingScreen.classList.remove("active");
        alert("Failed to fetch weather");
    }
}

/* ---------------- FETCH WEATHER (CITY) ---------------- */
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (searchInput.value === "") return;
    fetchSearchWeatherInfo(searchInput.value);
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        loadingScreen.classList.remove("active");
        alert("City not found");
    }
}

/* ---------------- RENDER WEATHER ---------------- */
function renderWeatherInfo(weatherData) {
    cityName.innerText = weatherData.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherData.sys.country.toLowerCase()}.png`;

    weatherDesc.innerText = weatherData.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`;

    temp.innerText = `${weatherData.main.temp.toFixed(1)} °C`;
    windspeed.innerText = `${weatherData.wind.speed} m/s`;
    humidity.innerText = `${weatherData.main.humidity}%`;
    cloud.innerText = `${weatherData.clouds.all}%`;
}
