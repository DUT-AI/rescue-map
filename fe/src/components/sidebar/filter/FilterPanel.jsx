// src/components/FilterPanel.jsx
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';

const selectStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',

    '& fieldset': {
      border: '1px solid rgba(0,0,0,0.08)',
      transition: 'all 0.2s ease',
    },

    '&:hover': {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      '& fieldset': {
        borderColor: 'rgba(239, 68, 68, 0.15)',
      },
    },

    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
      '& fieldset': {
        borderColor: '#EF4444',
        borderWidth: '2px',
      },
    },
  },

  '& .MuiSelect-select': {
    color: '#111827',
    fontWeight: 500,
    fontSize: '14px',
    paddingTop: '12px',
    paddingBottom: '12px',
  },

  '& .MuiInputLabel-root': {
    color: '#6B7280',
    fontSize: '14px',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#EF4444',
    },
  },

  '& .MuiSvgIcon-root': {
    color: '#9CA3AF',
  },
};

export default function FilterPanel({
  regions = [],
  selectedRegion,
  setSelectedRegion,
  selectedTimeRange,
  setSelectedTimeRange,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.08)',
        overflow: 'hidden',
        mb: 2.5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* ===== Header ===== */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: '#F9FAFB',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '10px',
            bgcolor: '#FEF2F2',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)',
          }}
        >
          <FilterListIcon sx={{ fontSize: 18, color: '#DC2626' }} />
        </Box>

        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{
            color: '#111827',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Bộ lọc tìm kiếm
        </Typography>
      </Box>

      {/* ===== Filters Body ===== */}
      <Box sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>

          {/* ===== Region Filter ===== */}
          <FormControl fullWidth size="medium" sx={selectStyles}>
            <InputLabel id="region-label">Khu vực</InputLabel>
            <Select
              labelId="region-label"
              label="Khu vực"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              IconComponent={ExpandMoreIcon}
            >
              <MenuItem value="all">
                <span
                  style={{
                    fontStyle: 'italic',
                    color: '#6B7280',
                    fontWeight: 500,
                  }}
                >
                  Toàn quốc
                </span>
              </MenuItem>

              {regions.map((reg) => (
                <MenuItem key={reg.id} value={reg.id} sx={{ fontWeight: 500 }}>
                  {reg.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ===== Time Filter ===== */}
          <FormControl fullWidth size="medium" sx={selectStyles}>
            <InputLabel id="time-range-label">Thời gian</InputLabel>
            <Select
              labelId="time-range-label"
              label="Thời gian"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              IconComponent={ExpandMoreIcon}
            >
              <MenuItem value="all" sx={{ fontWeight: 500 }}>
                Mọi lúc
              </MenuItem>
              <MenuItem value="day" sx={{ fontWeight: 500 }}>
                24 giờ qua
              </MenuItem>
              <MenuItem value="week" sx={{ fontWeight: 500 }}>
                Tuần qua
              </MenuItem>
              <MenuItem value="month" sx={{ fontWeight: 500 }}>
                Tháng qua
              </MenuItem>
            </Select>
          </FormControl>

        </Stack>
      </Box>
    </Paper>
  );
}
