import calculateAQI from "./CaluculateAQI";

export async function LocationAutoFill() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

          // Fetch AQI with fallback
          let aqi = { overallAQI: 45 };
          try {
            const aqiRes = await fetch(
              `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=demo_key`
            );
            const aqiData = await aqiRes.json();
            if (aqiData && aqiData.list && aqiData.list[0]) {
              aqi = calculateAQI(aqiData.list[0].components);
            }
          } catch (e) {
            console.log("AQI fetch fallback used");
          }
          resolve(aqi);
      },
      (err) => reject(err)
    );
  });
}


