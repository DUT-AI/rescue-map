import requests
from urllib.parse import quote_plus
from app.core.config import MAPBOX_TOKEN

class GeocodeService:
    def __init__(self,
                 MAPBOX_BASE="https://api.mapbox.com/geocoding/v5/mapbox.places"):
        self.MAPBOX_BASE = MAPBOX_BASE

    def forward_geocode(self, address: str, limit: int = 1):
        """Forward geocode address -> returns dict: { "type": "Point", "coordinates": [lon, lat], "address": place_name }"""
        if not MAPBOX_TOKEN:
            raise RuntimeError("MAPBOX_TOKEN is not configured")

        q = quote_plus(address)
        url = f"{self.MAPBOX_BASE}/{q}.json"
        params = {"access_token": MAPBOX_TOKEN, "limit": limit, "autocomplete": "false"}
        try:
            resp = requests.get(url, params=params, timeout=10)

            if resp.status_code != 200:
                return None
            data = resp.json()

            features = data.get("features") or []
            if not features:
                return None

            feat = features[0]
            center = feat.get("center")  # [lon, lat]
            place_name = feat.get("place_name")

            if center and len(center) >= 2:
                return {"type": "Point", "coordinates": [center[0], center[1]], "address": place_name}

            return None
        except Exception as e:
            return None