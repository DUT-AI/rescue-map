// src/store/incidentStore.js
import { create } from 'zustand';
import { getAllRescueRequests } from '../services/rescueRequestService';
import { getAllRegions } from '../services/regionService';
import { getAllDisasterTypes } from '../services/disasterTypeService';
import { extractCoordsFromURL } from '../utils/mapUtils';

// === Helper làm giàu dữ liệu ===
const enrichIncidents = (incidents, regions, categories) => {
  const regionMap = new Map(regions.map(reg => [reg.id, reg.name]));
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

  return incidents.map(incident => {
    const coords = extractCoordsFromURL(incident.map_link);

    // GeoJSON format: [lng, lat]
    const coordinateLng = incident.coordinate?.coordinates?.[0];
    const coordinateLat = incident.coordinate?.coordinates?.[1];

    const locationLng = incident.location?.coordinates?.[0];
    const locationLat = incident.location?.coordinates?.[1];

    const rawLat =
      coordinateLat ??
      locationLat ??
      coords?.lat ??
      incident.latitude ??
      incident.lat ??
      null;

    const rawLng =
      coordinateLng ??
      locationLng ??
      coords?.lng ??
      incident.longitude ??
      incident.lng ??
      null;

    const latitude = Number.isFinite(Number(rawLat)) ? Number(rawLat) : null;
    const longitude = Number.isFinite(Number(rawLng)) ? Number(rawLng) : null;

    if (latitude === null || longitude === null) {
      console.warn(
        `Incident ${incident.id} has invalid coords`,
        incident
      );
    }

    return {
      ...incident,
      regionName: regionMap.get(incident.region_id) || 'Không xác định',
      categoryName: categoryMap.get(incident.category_id) || 'Khác',
      latitude,
      longitude,
    };
  });
};

export const useIncidentStore = create((set, get) => ({
  // === STATE ===
  allIncidents: [],
  regions: [],
  categories: [],
  isLoading: true,
  isFetched: false,
  selectedIncident: null,
  filters: {
    searchTerm: '',
    selectedCategory: 'all',
    selectedRegion: 'all',
    selectedTimeRange: 'all',
  },

  // === ACTIONS ===
  actions: {
    fetchInitialData: async () => {
      if (get().isFetched) return;
      set({ isLoading: true });

      try {
        const [incidentsData, regionsData, categoriesData] = await Promise.all([
          getAllRescueRequests(),
          getAllRegions(),
          getAllDisasterTypes(),
        ]);

        const enrichedData = enrichIncidents(incidentsData, regionsData, categoriesData);

        set({
          allIncidents: enrichedData,
          regions: regionsData,
          categories: categoriesData,
          isFetched: true,
        });
      } catch (error) {
        console.error('Failed to fetch initial data', error);
      } finally {
        set({ isLoading: false });
      }
    },

    setSelectedRegion: (regionId) => {
      set((state) => ({
        filters: { ...state.filters, selectedRegion: regionId },
      }));
    },

    setSelectedCategory: (categoryId) => {
      set((state) => ({
        filters: { ...state.filters, selectedCategory: categoryId },
      }));
    },

    setSelectedTimeRange: (timeRange) => {
      set((state) => ({
        filters: { ...state.filters, selectedTimeRange: timeRange },
      }));
    },

    setSearchTerm: (term) => {
      set((state) => ({
        filters: { ...state.filters, searchTerm: term },
      }));
    },

    setSelectedIncident: (incident) => {
      set({ selectedIncident: incident });
    },
  },
}));
