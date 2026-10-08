import { useState, useEffect, useRef } from 'react';
import {
  Map as MapIcon,
  Navigation,
  Search,
  Filter,
  Clock,
  Building,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  ExternalLink,
  MapPin
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DashboardLayout from '../../../layouts/DashboardLayout';
import {
  getCampusLocations,
  createCampusLocation,
  updateCampusLocation,
  deleteCampusLocation
} from '../services/campusMapService';
import { useAuth } from '../../../context/AuthContext';

const CATEGORIES = ['All', 'Academic', 'Administrative', 'Facility', 'Cafeteria', 'Hostel', 'Sports'];

const CATEGORY_COLORS = {
  Academic: '#FACC15', // Yellow
  Administrative: '#C084FC', // Purple
  Facility: '#60A5FA', // Blue
  Cafeteria: '#FB923C', // Orange
  Hostel: '#34D399', // Emerald
  Sports: '#F87171' // Rose
};

const getCategoryMarkerIcon = (category) => {
  const color = CATEGORY_COLORS[category] || '#FACC15';
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #111;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.5);
      ">
        <div style="
          transform: rotate(45deg);
          width: 10px;
          height: 10px;
          background-color: #111;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

export default function CampusMap() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: 'Academic',
    buildingCode: '',
    latitude: '12.97160000',
    longitude: '77.59460000',
    openingHours: '08:00 AM - 08:00 PM',
    description: ''
  });

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getCampusLocations({
        category: category !== 'All' ? category : undefined
      });
      setLocations(res.data || []);
      if (res.data?.length > 0 && !selectedLocation) {
        setSelectedLocation(res.data[0]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load campus locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [category]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 16,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when locations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = [];

    locations.forEach((loc) => {
      const lat = parseFloat(loc.latitude);
      const lng = parseFloat(loc.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        bounds.push([lat, lng]);
        const icon = getCategoryMarkerIcon(loc.category);
        const marker = L.marker([lat, lng], { icon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: Poppins, sans-serif; font-size: 12px; color: #111; padding: 4px;">
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px;">${loc.name}</div>
            <div style="font-size: 10px; color: #555; text-transform: uppercase; margin-bottom: 6px;">
              ${loc.building_code ? `[${loc.building_code}] ` : ''}${loc.category}
            </div>
            <div style="font-size: 11px; margin-bottom: 4px;">${loc.description || ''}</div>
            <div style="font-size: 10px; color: #333; font-weight: 600;">🕒 ${loc.opening_hours || 'Open Campus'}</div>
          </div>
        `);

        marker.on('click', () => {
          setSelectedLocation(loc);
        });

        markersRef.current.push(marker);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    }
  }, [locations]);

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    const map = mapInstanceRef.current;
    if (map) {
      const lat = parseFloat(loc.latitude);
      const lng = parseFloat(loc.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 17, { duration: 1.2 });
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setForm({
      name: '',
      category: 'Academic',
      buildingCode: '',
      latitude: '12.97160000',
      longitude: '77.59460000',
      openingHours: '08:00 AM - 08:00 PM',
      description: ''
    });
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLocation(loc);
    setForm({
      name: loc.name,
      category: loc.category,
      buildingCode: loc.building_code || '',
      latitude: String(loc.latitude),
      longitude: String(loc.longitude),
      openingHours: loc.opening_hours || '',
      description: loc.description || ''
    });
    setModalError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.latitude || !form.longitude) {
      setModalError('Location name, category, and coordinate coordinates are required.');
      return;
    }

    setModalLoading(true);
    setModalError('');
    try {
      const payload = {
        name: form.name,
        category: form.category,
        buildingCode: form.buildingCode || null,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        openingHours: form.openingHours || null,
        description: form.description || null
      };

      if (editingLocation) {
        await updateCampusLocation(editingLocation.location_id, payload);
      } else {
        await createCampusLocation(payload);
      }
      setShowModal(false);
      fetchLocations();
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Failed to save campus pin.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (locationId) => {
    if (!window.confirm('Are you sure you want to remove this map pin?')) return;
    try {
      await deleteCampusLocation(locationId);
      if (selectedLocation?.location_id === locationId) {
        setSelectedLocation(null);
      }
      fetchLocations();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete campus pin.');
    }
  };

  const filteredLocations = locations.filter((loc) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      loc.name?.toLowerCase().includes(term) ||
      loc.building_code?.toLowerCase().includes(term) ||
      loc.description?.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-5 h-full flex flex-col">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-800 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Interactive Campus Map</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Navigate department buildings, lecture complexes, study libraries, laboratories, and cafeterias.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Campus Pin</span>
            </button>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-carbon-black-400 border border-gray-800 p-2.5 rounded-2xl flex-shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  category === c
                    ? 'bg-yellow-300 text-black font-semibold'
                    : 'bg-carbon-black-100 text-gray-300 hover:bg-gray-800 border border-gray-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="sm:w-64 relative">
            <input
              type="text"
              placeholder="Search buildings or codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-carbon-black-100 border border-gray-700 text-gray-200 text-xs px-3 py-1.5 pl-8 rounded-xl outline-none focus:border-yellow-400 transition"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Map & Sidebar Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[520px]">
          {/* Left Buildings Directory List */}
          <div className="lg:col-span-4 bg-carbon-black-400 border border-gray-800 rounded-2xl p-3.5 flex flex-col h-[520px] lg:h-auto overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Locations ({filteredLocations.length})
              </span>
              <span className="text-[11px] text-gray-500">Click to center on map</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="p-8 text-center text-xs text-gray-400">Loading campus locations...</div>
              ) : filteredLocations.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">No locations found.</div>
              ) : (
                filteredLocations.map((loc) => {
                  const isSelected = selectedLocation?.location_id === loc.location_id;
                  const catColor = CATEGORY_COLORS[loc.category] || '#FACC15';

                  return (
                    <div
                      key={loc.location_id}
                      onClick={() => handleSelectLocation(loc)}
                      className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                        isSelected
                          ? 'bg-carbon-black-100 border-yellow-400/80 shadow-md'
                          : 'bg-carbon-black border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: catColor }}
                          ></span>
                          <h4 className="text-xs font-bold text-white leading-tight">{loc.name}</h4>
                        </div>
                        {loc.building_code && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-gray-800 text-yellow-300 border border-gray-700">
                            {loc.building_code}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-1.5">{loc.description}</p>

                      <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-gray-400" />
                          <span>{loc.opening_hours || 'Campus Hours'}</span>
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEdit(loc)}
                              className="p-1 hover:text-white text-gray-400 rounded transition"
                              title="Edit Pin"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(loc.location_id)}
                              className="p-1 hover:text-red-400 text-gray-400 rounded transition"
                              title="Delete Pin"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Location Card Preview */}
            {selectedLocation && (
              <div className="mt-3 pt-3 border-t border-gray-800 bg-carbon-black-100 p-3 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-yellow-300 tracking-wider">
                    Selected Building
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.latitude},${selectedLocation.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-yellow-300 transition"
                  >
                    <span>External GPS</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
                <h3 className="text-xs font-bold text-white mt-1">{selectedLocation.name}</h3>
                <p className="text-[11px] text-gray-400 mt-1">{selectedLocation.description}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin size={11} className="text-yellow-300" />
                    <span>
                      {selectedLocation.latitude}, {selectedLocation.longitude}
                    </span>
                  </div>
                  <span className="text-gray-300 font-medium">{selectedLocation.opening_hours}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Leaflet Map Canvas */}
          <div className="lg:col-span-8 bg-carbon-black-400 border border-gray-800 rounded-2xl overflow-hidden min-h-[500px] relative shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-10" />
          </div>
        </div>

        {/* Admin Pin Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h2 className="text-base font-bold text-white">
                  {editingLocation ? 'Edit Campus Location Pin' : 'Add Campus Map Pin'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              {modalError && (
                <div className="mt-3 p-2.5 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-3 mt-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Building / Facility Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramanujan Center for Computing"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Building Code</label>
                    <input
                      type="text"
                      placeholder="e.g. RCC-1"
                      value={form.buildingCode}
                      onChange={(e) => setForm({ ...form, buildingCode: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="12.9719"
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="77.5946"
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Opening Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00 AM - 08:00 PM or 24 Hours"
                    value={form.openingHours}
                    onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Description / Key Facilities</label>
                  <textarea
                    rows={3}
                    placeholder="Offices, departments, laboratories, or services housed here..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {modalLoading ? 'Saving...' : editingLocation ? 'Save Changes' : 'Add Map Pin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
