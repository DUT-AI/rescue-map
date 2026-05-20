import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';

// === 1. Cấu hình & Assets ===
const disasterIcons = {
  "Lũ lụt": "🌊", "Sạt lở đất": "🪨", "Bão": "🌪️", "Hạn hán": "☀️",
  "Động đất": "🌍", "Cháy rừng": "🔥", "Lũ quét": "💧", "Triều cường": "🌊",
};

const statusConfig = {
  pending: { label: 'CHỜ XỬ LÝ', bg: '#FFF7ED', color: '#C2410C', border: '#FFEDD5' },
  in_progress: { label: 'ĐANG XỬ LÝ', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  resolved: { label: 'ĐÃ GIẢI QUYẾT', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  default: { label: 'KHÔNG XÁC ĐỊNH', bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' },
};

const urgencyConfig = {
  critical: { label: 'KHẨN CẤP', color: '#DC2626', bg: '#FEF2F2' },
  high: { label: 'CAO', color: '#D97706', bg: '#FFFBEB' },
  medium: { label: 'TRUNG BÌNH', color: '#2563EB', bg: '#EFF6FF' },
  low: { label: 'THẤP', color: '#059669', bg: '#ECFDF5' },
};

const getUrgencyLevel = (score) => {
  if (score >= 8) return 'critical';
  if (score >= 6) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
};

export default function RescueCard({ incident, onFocus }) {
  if (!incident) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  // Data extraction
  const {
    title = "Chưa có tiêu đề",
    content = "Chưa có mô tả.",
    status = "default",
    categoryName = "Khác",
    regionName = "Không xác định",
    posted_time,
    image: imageUrl,
    latitude,
    longitude,
    urgency_score = 0,
    affected_people,
    is_isolated,
    deathly,
    infrastructure_damage
  } = incident;

  const hasCoordinates = latitude && longitude;
  const urgencyLevel = getUrgencyLevel(urgency_score);
  const statusStyle = statusConfig[status] || statusConfig.default;

  const handleMapClick = () => {
    if (onFocus && hasCoordinates) onFocus(incident);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / 3600000);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return date.toLocaleDateString('vi-VN');
    } catch { return timeStr; }
  };

  return (
    <>
      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        elevation={0}
        sx={{
          mb: 2.5,
          borderRadius: '16px',
          border: '1px solid rgba(0,0,0,0.08)',
          overflow: 'hidden',
          cursor: 'pointer',
          background: '#FFFFFF',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
          }
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* === Header Section === */}
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <Chip
                label={statusStyle.label}
                size="small"
                sx={{
                  bgcolor: statusStyle.bg,
                  color: statusStyle.color,
                  border: `1px solid ${statusStyle.border}`,
                  fontSize: '10px',
                  fontWeight: 700,
                  height: 22,
                  letterSpacing: '0.5px',
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#111827',
                  mt: 1,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {title}
              </Typography>

              {urgency_score > 0 && (
                <Chip
                  icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                  label={`${urgencyConfig[urgencyLevel].label} (${urgency_score.toFixed(1)})`}
                  size="small"
                  sx={{
                    bgcolor: urgencyConfig[urgencyLevel].bg,
                    color: urgencyConfig[urgencyLevel].color,
                    fontSize: '10px',
                    fontWeight: 700,
                    height: 22,
                    mt: 0.5,
                  }}
                />
              )}
            </Box>

            {/* Category Icon */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#F9FAFB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              {disasterIcons[categoryName] || "⚠️"}
            </Box>
          </Box>

          {/* === Meta Info === */}
          <Stack spacing={0.8} sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6B7280', fontSize: '13px' }}>
                <CategoryIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
                  {categoryName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6B7280', fontSize: '13px' }}>
                <LocationOnIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
                  {regionName}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {affected_people ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#D97706', fontSize: '13px' }}>
                  <PeopleIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600 }}>
                    {affected_people.toLocaleString()} bị ảnh hưởng
                  </Typography>
                </Box>
              ) : <Box />}

              {posted_time && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#9CA3AF', fontSize: '12px' }}>
                  <AccessTimeIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                    {formatTime(posted_time)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </CardContent>

        {/* === Expandable Content === */}
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ bgcolor: '#F9FAFB', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#374151',
                lineHeight: 1.6,
                fontSize: '14px',
                mb: 2,
              }}
            >
              {content}
            </Typography>

            {/* Tags */}
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {is_isolated && (
                <Chip label="🏝️ Cô lập" size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontSize: '11px', fontWeight: 600 }} />
              )}
              {deathly && (
                <Chip label="⚠️ Thương vong" size="small" sx={{ bgcolor: '#7F1D1D', color: '#FFF', fontSize: '11px', fontWeight: 600 }} />
              )}
              {infrastructure_damage && (
                <Chip label="🏗️ Hư hỏng CSHT" size="small" sx={{ bgcolor: '#F3F4F6', color: '#374151', fontSize: '11px', fontWeight: 600 }} />
              )}
            </Stack>

            {/* Map Button */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<MapIcon />}
              disabled={!hasCoordinates}
              onClick={(e) => {
                e.stopPropagation();
                handleMapClick();
              }}
              sx={{
                mt: 2,
                borderRadius: '10px',
                py: 1.2,
                fontWeight: 700,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                bgcolor: hasCoordinates ? '#2563EB' : '#F3F4F6',
                color: hasCoordinates ? '#FFF' : '#9CA3AF',
                boxShadow: hasCoordinates ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                '&:hover': {
                  bgcolor: hasCoordinates ? '#1D4ED8' : '#F3F4F6',
                  boxShadow: hasCoordinates ? '0 6px 16px rgba(37, 99, 235, 0.35)' : 'none',
                },
                '&:disabled': {
                  bgcolor: '#F3F4F6',
                  color: '#9CA3AF',
                }
              }}
            >
              {hasCoordinates ? 'Xem vị trí trên bản đồ' : 'Không có tọa độ'}
            </Button>
          </CardContent>
        </Collapse>

        {/* Expand Icon */}
        <CardActions sx={{ justifyContent: 'center', py: 0.5, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
          <IconButton
            size="small"
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              color: '#6B7280',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </CardActions>
      </Card>
    </>
  );
}
