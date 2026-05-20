from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
from datetime import datetime
from typing import Optional, Any, Dict, Union
from geoalchemy2.shape import to_shape

class CoordinateSchema(BaseModel):
    """GeoJSON Point format"""
    type: str = Field(default="Point", description="GeoJSON type")
    coordinates: Optional[list[float]] = Field(None, description="[longitude, latitude]")

class RescueRequestBase(BaseModel):
    title: Optional[str] = Field(None, description="Title (auto-generated if not provided)")
    location: Optional[str] = Field(None, description="Address text")
    coordinate: Optional[Dict[str, Any]] = Field(None, description="Pre-geocoded coordinate as GeoJSON (auto-geocoded from location if not provided)")
    content: Optional[str] = None
    map_link: Optional[str] = None
    status: Optional[str] = None
    posted_time: Optional[str] = Field(None, description="Posted time (ISO format or shorthand like '1w', '2d', '3h')")
    created_date: Optional[datetime] = None
    image: Optional[str] = None
    urgency_score: Optional[Union[float, str]] = Field(None, description="Urgency score 0-10 or text 'CAO'/'TRUNG BÌNH'/'THẤP'")
    reliability_score: Optional[Union[float, str]] = Field(None, description="Reliability score 0-10 or text 'CAO'/'TRUNG BÌNH'/'THẤP'")
    contact: Optional[str] = None
    region_id: Optional[int] = Field(None, description="Region ID (auto-detected from location if not provided)")
    
    # New fields
    affected_people: Optional[int] = None
    infrastructure_damage: Optional[bool] = None
    is_isolated: bool = False
    deathly: bool = False
    has_emergency: bool = False
    has_emotion: bool = False
    has_emphasis: bool = False
    reactions: int = 0
    replies: int = 0
    
    # Many-to-many relationships - support both ID lists and text formats
    needs_ids: Optional[list[int]] = Field(default_factory=list, description="List of needs IDs")
    needs_text: Optional[str] = Field(None, description="Needs as text (alternative to needs_ids, will be parsed)")
    disaster_type_ids: Optional[list[int]] = Field(default_factory=list, description="List of disaster type IDs")
    disaster_type_text: Optional[str] = Field(None, description="Disaster types as text (alternative to disaster_type_ids, will be parsed)")

class RescueRequestCreate(RescueRequestBase):
    pass

class RescueRequestUpdate(RescueRequestBase):
    pass

class RescueRequestOut(BaseModel):
    """Response schema - coordinate is handled specially due to PostGIS geometry"""
    id: int
    title: str
    location: Optional[str] = None
    coordinate: Optional[Dict[str, Any]] = None
    content: Optional[str] = None
    map_link: Optional[str] = None
    status: Optional[str] = None
    posted_time: Optional[str] = None
    created_date: Optional[datetime] = None
    image: Optional[str] = None
    urgency_score: Optional[float] = None
    reliability_score: Optional[float] = None
    contact: Optional[str] = None
    region_id: Optional[int] = None
    affected_people: Optional[int] = None
    infrastructure_damage: Optional[bool] = None
    is_isolated: bool = False
    deathly: bool = False
    has_emergency: bool = False
    has_emotion: bool = False
    has_emphasis: bool = False
    reactions: int = 0
    replies: int = 0

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)
    
    @field_validator('coordinate', mode='before')
    @classmethod
    def serialize_coordinate(cls, v, info):
        """Convert geometry/WKBElement to GeoJSON dict"""
        if v is None:
            return None
        
        # If it's already a dict (from input)
        if isinstance(v, dict):
            return v
        
        # Convert WKBElement to Shapely geometry first
        try:
            from geoalchemy2.shape import to_shape
            geom = to_shape(v)
            geo = geom.__geo_interface__
            coords = geo.get('coordinates')
            return {
                'type': geo.get('type', 'Point'),
                'coordinates': list(coords) if coords else None
            }
        except Exception as e:
            # Fallback: If it has __geo_interface__ directly
            if hasattr(v, '__geo_interface__'):
                geo = v.__geo_interface__
                coords = geo.get('coordinates')
                return {
                    'type': geo.get('type', 'Point'),
                    'coordinates': list(coords) if coords else None
                }
        
        return None
    
    @field_validator('urgency_score', 'reliability_score')
    def validate_score(cls, v):
        if v is not None and (v < 0 or v > 10):
            raise ValueError('Score must be between 0 and 10')
        return v