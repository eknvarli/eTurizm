import * as turf from '@turf/turf'

export function calculateSweetSpot(isochroneMap, useTransit = true) {
  if (!isochroneMap || isochroneMap.size === 0) return null

  const placePolygons = []

  for (const [, isoData] of isochroneMap) {
    if (isoData.error) continue

    let placePolygon = null

    const walkFeatures = extractPolygons(isoData.walk)
    if (walkFeatures.length > 0) {
      placePolygon = mergePolygons(walkFeatures)
    }

    if (useTransit && isoData.transit) {
      const transitFeatures = extractPolygons(isoData.transit)
      if (transitFeatures.length > 0) {
        const transitUnion = mergePolygons(transitFeatures)
        placePolygon = placePolygon
          ? safeUnion(placePolygon, transitUnion)
          : transitUnion
      }
    }

    if (placePolygon) {
      placePolygons.push(placePolygon)
    }
  }

  if (placePolygons.length === 0) return null
  if (placePolygons.length === 1) return placePolygons[0]

  return intersectAll(placePolygons)
}

function intersectAll(polygons) {
  let result = polygons[0]

  for (let i = 1; i < polygons.length; i++) {
    try {
      const intersection = turf.intersect(
        turf.featureCollection([result, polygons[i]])
      )
      if (!intersection) return null
      result = intersection
    } catch (err) {
      console.warn('[SweetSpot] Kesişim hesaplama hatası:', err)
      return null
    }
  }

  return result
}

function extractPolygons(geoJSON) {
  if (!geoJSON?.features) return []

  return geoJSON.features.filter(f =>
    f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon'
  )
}

function mergePolygons(features) {
  if (features.length === 0) return null
  if (features.length === 1) return features[0]

  try {
    return turf.union(turf.featureCollection(features))
  } catch (err) {
    console.warn('[Turf] Union hatası:', err)
    return features[0]
  }
}

function safeUnion(poly1, poly2) {
  try {
    return turf.union(turf.featureCollection([poly1, poly2])) || poly1
  } catch {
    return poly1
  }
}

export function calculateArea(polygon) {
  if (!polygon) return 0
  const areaM2 = turf.area(polygon)
  return Math.round(areaM2 / 1_000_000 * 100) / 100
}

export function getPolygonCenter(polygon) {
  if (!polygon) return null
  return turf.centroid(polygon)
}

export function isPointInPolygon(lngLat, polygon) {
  if (!polygon) return false
  const pt = turf.point(lngLat)
  return turf.booleanPointInPolygon(pt, polygon)
}

export function getSweetSpotBounds(polygon) {
  if (!polygon) return null
  return turf.bbox(polygon)
}

export function calculateRouteDistance(places) {
  if (places.length < 2) return 0

  let totalKm = 0
  for (let i = 0; i < places.length - 1; i++) {
    const from = turf.point([places[i].lngLat.lng, places[i].lngLat.lat])
    const to = turf.point([places[i + 1].lngLat.lng, places[i + 1].lngLat.lat])
    totalKm += turf.distance(from, to, { units: 'kilometers' })
  }

  return Math.round(totalKm * 10) / 10
}

export function getPlacesBounds(places) {
  if (places.length === 0) return null
  if (places.length === 1) {
    const { lng, lat } = places[0].lngLat
    return [[lng - 0.05, lat - 0.05], [lng + 0.05, lat + 0.05]]
  }

  const points = turf.featureCollection(
    places.map(p => turf.point([p.lngLat.lng, p.lngLat.lat]))
  )
  const [minLng, minLat, maxLng, maxLat] = turf.bbox(points)
  const padding = 0.02
  return [[minLng - padding, minLat - padding], [maxLng + padding, maxLat + padding]]
}
