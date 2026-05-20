// src/pages/HomePage.jsx
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, CircularProgress, Fab, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useFilteredData } from '../hooks/useFilteredData';
import { useIncidentStore } from '../store/incidentStore';

// Import các component mới
import MapComponent from '../components/map/MapComponent';
import Sidebar from '../components/sidebar/SideBar';
import FilterPanel from '../components/sidebar/filter/FilterPanel';
import RescueCard from '../components/sidebar/incidents/RescueCard';
import SearchBar from '../components/sidebar/search/SearchBar';

function HomePage() {
  // 1. Lấy state từ store với selector riêng lẻ để tránh tạo object mới mỗi render
  const allIncidents = useIncidentStore((state) => state.allIncidents);
  const filters = useIncidentStore((state) => state.filters);
  const selectedIncident = useIncidentStore((state) => state.selectedIncident);
  const isLoading = useIncidentStore((state) => state.isLoading);
  const categories = useIncidentStore((state) => state.categories);
  const regions = useIncidentStore((state) => state.regions);
  // Lấy actions từ store
  const fetchInitialData = useIncidentStore((state) => state.actions.fetchInitialData);
  const setSelectedIncident = useIncidentStore((state) => state.actions.setSelectedIncident);
  const setSearchTerm = useIncidentStore((state) => state.actions.setSearchTerm);
  const setSelectedCategory = useIncidentStore((state) => state.actions.setSelectedCategory);
  const setSelectedRegion = useIncidentStore((state) => state.actions.setSelectedRegion);
  const setSelectedTimeRange = useIncidentStore((state) => state.actions.setSelectedTimeRange);

  // 2. State riêng của HomePage
  const [mapBounds, setMapBounds] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State để điều khiển sidebar

  // 3. Sử dụng useEffect để fetch dữ liệu ban đầu
  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4. Sử dụng hook mới để lọc dữ liệu
  const filteredIncidents = useFilteredData(allIncidents, filters, mapBounds);

  // 5. Tối ưu hóa các hàm callback
  const handleMarkerClick = useCallback((incident) => {
    setSelectedIncident(incident);
  }, [setSelectedIncident]);

  const handleCardClick = useCallback((incident) => {
    setSelectedIncident(incident);
  }, [setSelectedIncident]);

  const handleFocusOnMap = useCallback((incident) => {
    setSelectedIncident(incident);
  }, [setSelectedIncident]);


  return (
    <Box sx={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', bgcolor: '#F9FAFB' }}>
      {/* --- SIDEBAR --- */}
      <Sidebar isOpen={isSidebarOpen}>
        <SearchBar searchTerm={filters.searchTerm} setSearchTerm={setSearchTerm} />
        <FilterPanel
          categories={categories}
          regions={regions}
          selectedCategory={filters.selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedRegion={filters.selectedRegion}
          setSelectedRegion={setSelectedRegion}
          selectedTimeRange={filters.selectedTimeRange}
          setSelectedTimeRange={setSelectedTimeRange}
        />
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <CircularProgress
              size={50}
              thickness={4}
              sx={{ color: '#EF4444' }}
            />
            <Typography sx={{ color: '#6B7280', fontSize: '14px', fontWeight: 500 }}>
              Đang tải dữ liệu...
            </Typography>
          </Box>
        )}
        {!isLoading && (
          <Stack spacing={0}>
            {filteredIncidents.map((incident) => (
              <RescueCard
                key={incident.id}
                incident={incident}
                onFocus={handleFocusOnMap}
              />
            ))}
          </Stack>
        )}
        {!isLoading && filteredIncidents.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              p: 4,
              mt: 4,
              background: 'rgba(249, 250, 251, 0.8)',
              borderRadius: '16px',
              border: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <Typography sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}>
              📭
            </Typography>
            <Typography sx={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}>
              Không tìm thấy sự cố nào phù hợp
            </Typography>
          </Box>
        )}
      </Sidebar>

      <Box component="main" sx={{ flex: 1, position: 'relative' }}>
        <Fab
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            '&:hover': {
              backgroundColor: 'white',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </Fab>
        <MapComponent
            incidents={filteredIncidents}
            onMarkerClick={handleFocusOnMap}
            selectedIncident={selectedIncident}
        />
      </Box>
    </Box>
  );
}

export default HomePage;
