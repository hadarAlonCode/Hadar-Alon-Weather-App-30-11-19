
import { observable, action } from 'mobx'
import axios from 'axios';



export class CityStore {

    api_key = "Nb1xFn0braCp8CCG9iI4L0EX7Ozgxo9e"
    @observable city = {
        name: "",
        cityKey: 0,
        weatherText: "",
        currentTemp: 0,
        unit: "",
        fiveDays: [],
        icon: "1",
        isFavorite: false,
        date: ""
    }
    @observable error = false
    @observable isFirstLogin = true

    @action getLocation = async (location) => {

        try {
            this.error = false
            const response = await axios.get(`https://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${this.api_key}&q=${location}`)
            this.getCurrentWeather(response.data[0].LocalizedName, response.data[0].Key)

            return true
        }
        catch (error) {

            return false
        }
    }

    @action getCurrentWeather = async (name, key) => {

        try {
            this.error = false
            const response = await axios.get(`https://dataservice.accuweather.com/currentconditions/v1/${key}?apikey=${this.api_key}`)
            this.city.name = name
            this.city.cityKey = key
            this.city.weatherText = response.data[0].WeatherText
            this.city.currentTemp = Math.round(response.data[0].Temperature.Metric.Value)
            this.city.unit = response.data[0].Temperature.Metric.Unit
            this.city.icon = response.data[0].WeatherIcon
            this.city.date = response.data[0].LocalObservationDateTime
            this.city.isFavorite = this.localFavorite(this.city.cityKey)
            this.getFiveDays()
        }
        catch (error) {
            return error
        }
    }

    @action getFiveDays = async () => {

        try {
            const response = await axios.get(`https://dataservice.accuweather.com/forecasts/v1/daily/5day/${this.city.cityKey}?apikey=${this.api_key}&metric=true`)
            let id = 0
            this.city.fiveDays = []

            for (let d of response.data.DailyForecasts) {
                id++
                this.city.fiveDays.push({ day: d.Date, minTemp: Math.round(d.Temperature.Minimum.Value), maxTemp: Math.round(d.Temperature.Maximum.Value), id: id, icon: d.Day.Icon })
            }
        }
        catch (error) {
            return error
        }
    }

    @action iconsFunc = (icon) => {
        if (icon <= 9) {
            return "https://developer.accuweather.com/sites/default/files/0" + icon + "-s.png"
        } else {
            return "https://developer.accuweather.com/sites/default/files/" + icon + "-s.png"
        }
    }


    @action favorite = () => {
        this.city.isFavorite ? this.city.isFavorite = false : this.city.isFavorite = true
    }

    @action localFavorite = (key) => {
        if (localStorage.favoriteCities) {
            let local_Storage = JSON.parse(localStorage.favoriteCities)
            let city = local_Storage.find(c => c.key == key)

            if (city) {
                return true

            } else {
                return false
            }

        } else {
            return false

        }
    }

    @action geoLocation = () => {
        this.isFirstLogin = false
        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(this.showPosition);
        } else {

            this.getCurrentWeather("Tel Aviv", "215854")
        }
    }

    showPosition = async (position) => {

        try {
            let location = `${position.coords.latitude},${position.coords.longitude}`
            const response = await axios.get(`https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${this.api_key}&q=${location}`)
            let cityKey = response.data.Key
            let cityName = response.data.AdministrativeArea.LocalizedName

            this.getCurrentWeather(cityName, cityKey)
        }

        catch (error) {
            return error
        }

    }
}



export default new CityStore()



