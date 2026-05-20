"""
Service to import rescue requests from JSON file
"""
import json
from sqlalchemy.orm import Session
from app.services.rescue_request_service import RescueRequestService
from app.schemas.rescue_request_schema import RescueRequestCreate
from typing import Dict, Any

def parse_boolean(value: Any) -> bool:
    """Parse various boolean representations"""
    if value is None:
        return False
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ['true', '1', 'yes', 'có', 'x']
    return bool(value)

def import_json_data(data: list[Dict[str, Any]], db: Session) -> Dict[str, Any]:
    """Import rescue requests from JSON data (list of dicts) using RescueRequestService with transforms"""
    try:
        success_count = 0
        error_count = 0
        errors = []
        
        for idx, row in enumerate(data):
            try:
                # Build data dict from JSON object
                data_dict = {
                    'content': str(row.get('content', '')) if row.get('content') is not None else None,
                    'location': str(row.get('location', '')) if row.get('location') is not None else None,
                    'contact': str(row.get('contact', '')) if row.get('contact') is not None else None,
                }
                
                # Optional fields
                if 'title' in row and row.get('title') is not None:
                    data_dict['title'] = str(row['title'])
                
                # Map 'needs' column to needs_text
                if 'needs_text' in row and row.get('needs_text') is not None:
                    data_dict['needs_text'] = str(row['needs_text'])
                elif 'needs' in row and row.get('needs') is not None:
                    data_dict['needs_text'] = str(row['needs'])
                    
                if 'disaster_type_text' in row and row.get('disaster_type_text') is not None:
                    data_dict['disaster_type_text'] = str(row['disaster_type_text'])
                elif 'disaster_type' in row and row.get('disaster_type') is not None:
                    data_dict['disaster_type_text'] = str(row['disaster_type'])
                
                # Map 'label' column to urgency_score
                if 'urgency_score' in row and row.get('urgency_score') is not None:
                    data_dict['urgency_score'] = str(row['urgency_score'])
                elif 'label' in row and row.get('label') is not None:
                    data_dict['urgency_score'] = str(row['label'])
                    
                # Map 'confident' column to reliability_score  
                if 'reliability_score' in row and row.get('reliability_score') is not None:
                    data_dict['reliability_score'] = str(row['reliability_score'])
                elif 'confident' in row and row.get('confident') is not None:
                    data_dict['reliability_score'] = str(row['confident'])
                
                if 'posted_time' in row and row.get('posted_time') is not None:
                    data_dict['posted_time'] = str(row['posted_time'])
                
                if 'affected_people' in row and row.get('affected_people') is not None:
                    data_dict['affected_people'] = int(row['affected_people'])
                
                # Boolean fields
                data_dict['is_isolated'] = parse_boolean(row.get('is_isolated'))
                data_dict['infrastructure_damage'] = parse_boolean(row.get('infrastructure_damage'))
                data_dict['deathly'] = parse_boolean(row.get('deathly'))
                data_dict['has_emergency'] = parse_boolean(row.get('has_emergency'))
                data_dict['has_emotion'] = parse_boolean(row.get('has_emotion'))
                data_dict['has_emphasis'] = parse_boolean(row.get('has_emphasis'))
                
                if 'reactions' in row and row.get('reactions') is not None:
                    data_dict['reactions'] = int(row['reactions'])
                else:
                    data_dict['reactions'] = 0
                    
                if 'replies' in row and row.get('replies') is not None:
                    data_dict['replies'] = int(row['replies'])
                else:
                    data_dict['replies'] = 0
                
                # Create schema object
                rescue_data = RescueRequestCreate(**data_dict)
                
                # Use RescueRequestService.create() with all transforms
                RescueRequestService.create(db, rescue_data)
                success_count += 1
                
            except Exception as e:
                error_count += 1
                errors.append(f"Row {idx + 1}: {str(e)}")
        
        return {
            "success": True,
            "total": len(data),
            "success_count": success_count,
            "error_count": error_count,
            "errors": errors
        }
        
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "error": str(e)
        }
