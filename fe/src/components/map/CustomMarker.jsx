// src/components/map/CustomMarker.jsx

import React from 'react';
import { Marker } from 'react-map-gl';
import { getMarkerColor } from '../../utils/getMarkerStyle';
import './CustomMarker.css'; // Import file CSS

const markerStyleBase = {
  width: '24px', // Tăng kích thước chút cho dễ bấm
  height: '24px',
  borderRadius: '50%',
  border: '2px solid white',
  cursor: 'pointer',
  boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
  transition: 'transform 0.2s ease',
};

const CustomMarker = React.memo(({ incident, onClick, isSelected }) => {
  const color = getMarkerColor(incident.urgency);

  return (
    // Ép kiểu về Number để tránh lỗi tọa độ
    <Marker longitude={Number(incident.longitude)} latitude={Number(incident.latitude)}>
      <div
        // Thêm class 'custom-marker' để nhận CSS pointer-events
        className={`custom-marker ${isSelected ? 'marker-selected' : ''}`}
        
        style={{
          ...markerStyleBase,
          backgroundColor: color,
          // Nếu đang chọn thì để animation CSS lo, nếu không thì scale bình thường
          transform: isSelected ? 'none' : 'scale(1)',
        }}
        
        onClick={(e) => {
          e.preventDefault(); // Ngăn hành vi mặc định
          e.stopPropagation(); // Ngăn click lan xuống bản đồ
          onClick(incident);
        }}
      />
    </Marker>
  );
});

export default CustomMarker;