from fastapi import APIRouter, Query, HTTPException
from app.services.geocode_service import GeocodeService

router = APIRouter(prefix="/geocode", tags=["geocode"])
geocode_service = GeocodeService()

@router.get("/forward")
def geocode_forward(address: str = Query(..., description="Địa chỉ đầy đủ cần geocode")):
    """Forward geocode: địa chỉ text -> tọa độ"""
    try:
        result = geocode_service.forward_geocode(address)
        if not result:
            raise HTTPException(status_code=404, detail="Không tìm được tọa độ cho địa chỉ")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))