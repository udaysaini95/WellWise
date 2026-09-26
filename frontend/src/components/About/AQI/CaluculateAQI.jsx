const breakpoints = {
  pm2_5: [
    [0, 30, 0, 50], [31, 60, 51, 100], [61, 90, 101, 200],
    [91, 120, 201, 300], [121, 250, 301, 400], [251, 500, 401, 500]
  ],
  pm10: [
    [0, 50, 0, 50], [51, 100, 51, 100], [101, 250, 101, 200],
    [251, 350, 201, 300], [351, 430, 301, 400], [431, 500, 401, 500]
  ],
  no2: [
    [0, 40, 0, 50], [41, 80, 51, 100], [81, 180, 101, 200],
    [181, 280, 201, 300], [281, 400, 301, 400], [401, 500, 401, 500]
  ],
  so2: [
    [0, 40, 0, 50], [41, 80, 51, 100], [81, 380, 101, 200],
    [381, 800, 201, 300], [801, 1600, 301, 400], [1601, 2000, 401, 500]
  ],
  co: [
    [0, 1.0, 0, 50], [1.1, 2.0, 51, 100], [2.1, 10, 101, 200],
    [10.1, 17, 201, 300], [17.1, 34, 301, 400], [34.1, 50, 401, 500]
  ],
  o3: [
    [0, 50, 0, 50], [51, 100, 51, 100], [101, 168, 101, 200],
    [169, 208, 201, 300], [209, 748, 301, 400], [749, 1000, 401, 500]
  ],
  nh3: [
    [0, 200, 0, 50], [201, 400, 51, 100], [401, 800, 101, 200],
    [801, 1200, 201, 300], [1201, 1800, 301, 400], [1801, 2000, 401, 500]
  ]
};

function calcSubIndex(value, pollutant) {
  // CO from µg/m³ → mg/m³
  if (pollutant === "co") value = value / 1000;

  const ranges = breakpoints[pollutant];
  for (let [B_LO, B_HI, I_LO, I_HI] of ranges) {
    if (value >= B_LO && value <= B_HI) {
      return ((I_HI - I_LO) / (B_HI - B_LO)) * (value - B_LO) + I_LO;
    }
  }
  return 0;
}

function getAQICategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

export default function calculateAQI(values) {
  const subIndices = {};
  Object.keys(breakpoints).forEach((p) => {
    if (values[p] !== undefined) {
      subIndices[p] = Math.round(calcSubIndex(values[p], p));
    }
  });

  const overallAQI = Math.max(...Object.values(subIndices));
  const category = getAQICategory(overallAQI);

  return {
    overallAQI: overallAQI,
    category,
    subIndices
  };
}
