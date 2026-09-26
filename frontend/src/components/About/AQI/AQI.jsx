import calculateAQI from "./CaluculateAQI";

export async function LocationAutoFill() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const aqiRes = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=bb0be0b51e3fc651f8fe208977402543`
          );
          const aqiData = await aqiRes.json();

          // console.log(aqiData.list[0].components);

          const aqi = calculateAQI(aqiData.list[0].components);
          resolve(aqi);
        } catch (err) {
          reject(err);
        }
      },
      (err) => reject(err)
    );
  });
}


