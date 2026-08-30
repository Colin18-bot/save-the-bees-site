function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function distanceBetweenKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function findNearestApiary(latitude, longitude, apiaries) {
  if (
    latitude == null ||
    longitude == null ||
    !Array.isArray(apiaries)
  ) {
    return null;
  }

  const candidates = apiaries
    .filter(
      (apiary) =>
        apiary.latitude != null &&
        apiary.longitude != null
    )
    .map((apiary) => ({
      ...apiary,
      distanceKm: distanceBetweenKm(
        latitude,
        longitude,
        Number(apiary.latitude),
        Number(apiary.longitude)
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return candidates[0] || null;
}

export function formatApiaryDistance(distanceKm) {
  if (distanceKm == null) return "";

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }

  return `${distanceKm.toFixed(1)} km away`;
}