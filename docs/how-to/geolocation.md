# Geolocation (Haversine + Bounding Box)

Store lat/lng points and search by proximity using a two-pass approach: bounding-box SQL pre-filter, then exact Haversine distance in the application layer.

## Schema

```sql
CREATE TABLE places (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  latitude   REAL NOT NULL,
  longitude  REAL NOT NULL,
  category   TEXT NOT NULL DEFAULT 'general',
  created_at TEXT NOT NULL
);
```

## Endpoints

| Method | Path             | Auth     |
| ------ | ---------------- | -------- |
| `POST` | `/places`        | Required |
| `GET`  | `/places`        | Optional |
| `GET`  | `/places/nearby` | Optional |
| `GET`  | `/places/bbox`   | Optional |
| `GET`  | `/places/:id`    | Optional |

Register `/places/nearby` and `/places/bbox` **before** `/places/:id` — otherwise the literal segments are captured as the `id` parameter.

## Haversine distance

SQLite has no trigonometric functions. Compute distance in TypeScript after a bounding-box SQL pre-filter:

```ts
const EARTH_RADIUS_KM = 6371.0;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
```

## Bounding box

Approximate the search area as a rectangle before the expensive Haversine pass:

```ts
function boundingBox(lat: number, lng: number, radiusKm: number) {
  const deltaLat = radiusKm / 111.0;
  const deltaLng = radiusKm / (111.0 * Math.max(Math.cos(toRad(lat)), 0.001));
  return {
    minLat: lat - deltaLat,
    maxLat: lat + deltaLat,
    minLng: lng - deltaLng,
    maxLng: lng + deltaLng,
  };
}
```

## Two-pass nearby search

```ts
async findNearby(lat: number, lng: number, radiusKm: number): Promise<PlaceWithDistance[]> {
  const box = boundingBox(lat, lng, radiusKm);

  // Pass 1: rough SQL bounding-box filter (fast, uses BETWEEN index if available)
  const candidates = await executor.fetchAll(
    `SELECT * FROM places
     WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?`,
    [box.minLat, box.maxLat, box.minLng, box.maxLng],
  );

  // Pass 2: exact Haversine filter + sort
  const results = candidates
    .map((row) => {
      const distKm = haversineKm(lat, lng, Number(row['latitude']), Number(row['longitude']));
      return { ...row, distanceKm: Math.round(distKm * 10000) / 10000 };
    })
    .filter((r) => r.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return results;
}
```

## Input validation

```ts
const MAX_RADIUS_KM = 20_000;

function validateNearbyParams(params: URLSearchParams) {
  const lat = Number(params.get('lat'));
  const lng = Number(params.get('lng'));
  const radius = Math.min(Math.max(Number(params.get('radius') ?? 10), 0), MAX_RADIUS_KM);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new ValidationException([
      new ValidationError('lat', 'lat must be -90 to 90', 'out_of_range'),
    ]);
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new ValidationException([
      new ValidationError('lng', 'lng must be -180 to 180', 'out_of_range'),
    ]);
  }
  return { lat, lng, radiusKm: radius };
}
```

Clamp `radius` to `[0, 20000]` rather than rejecting — a too-large radius is not invalid, just expensive.

## Security checklist

| Check                         | Pattern                                            |
| ----------------------------- | -------------------------------------------------- |
| Coordinate injection          | Validate range: lat ∈ [-90, 90], lng ∈ [-180, 180] |
| Radius DoS                    | Clamp to `MAX_RADIUS_KM`                           |
| SQL injection via coordinates | Parameterized queries only                         |

## Framework features used

| Feature        | Import                                   |
| -------------- | ---------------------------------------- |
| Validation     | `ValidationException`, `ValidationError` |
| UTC timestamps | `utcNowIso`                              |
