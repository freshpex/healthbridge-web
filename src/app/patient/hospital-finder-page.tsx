import { useEffect, useState } from "react";
import { MapPin, Phone, Stethoscope } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import type { Hospital } from "../../types/domain";
import { healthbridgeService } from "../../services/healthbridge-service";
import { useAuth } from "../auth/hooks/use-auth";

export function HospitalFinderPage() {
  const { token } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [radius, setRadius] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");

  // Common specialties for filter
  const specialties = ["General", "Emergency", "Cardiology", "Orthopedics", "Pediatrics", "Neurology", "Oncology", "Surgery", "Radiology"];

  useEffect(() => {
    const loadHospitals = async () => {
      setLoading(true);
      try {
        const hospitals = await healthbridgeService.listHospitals();
        setAllHospitals(hospitals);
        setHospitals(hospitals);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load hospitals");
      } finally {
        setLoading(false);
      }
    };
    loadHospitals();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (useLocation && (latitude === null || longitude === null)) {
        throw new Error("Location not available");
      }

      let results: Hospital[];

      if (useLocation && latitude !== null && longitude !== null) {
        results = await healthbridgeService.findNearbyHospitals(latitude, longitude, radius, specialty || undefined);
      } else if (searchQuery) {
        results = await healthbridgeService.searchHospitals(searchQuery, specialty || undefined);
      } else {
        results = allHospitals;
      }

      setHospitals(results);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setLocationError("");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setUseLocation(true);
        },
        (error) => {
          setLocationError(`Location error: ${error.message}`);
        }
      );
    } else {
      setLocationError("Geolocation not supported in this browser");
    }
  };

  return (
    <AppShell
      title="Hospital Finder"
      subtitle="Find the right healthcare facility based on your condition, location, and specialties."
    >
      <section className="hospital-finder-search">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-inputs">
            <div className="search-input-group">
              <label htmlFor="search-query">Search by name or location</label>
              <input
                id="search-query"
                type="text"
                placeholder="e.g., Riverside Medical, New York..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={useLocation}
              />
            </div>

            <div className="search-input-group">
              <label htmlFor="specialty-filter">Specialty</label>
              <select
                id="specialty-filter"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                <option value="">All specialties</option>
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="location-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={useLocation}
                  onChange={(e) => setUseLocation(e.target.checked)}
                />
                Use my location
              </label>
              {useLocation && latitude && longitude && (
                <small>
                  📍 {latitude.toFixed(4)}, {longitude.toFixed(4)} (Radius: {radius} km)
                </small>
              )}
            </div>

            {useLocation && !latitude && (
              <button
                type="button"
                className="secondary-button"
                onClick={handleUseLocation}
              >
                Enable Location
              </button>
            )}

            {useLocation && latitude && longitude && (
              <div className="radius-control">
                <label htmlFor="radius-input">Search radius: {radius} km</label>
                <input
                  id="radius-input"
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Searching..." : "Search hospitals"}
          </button>
        </form>

        {locationError && (
          <div className="error-state">
            <strong>Location Error:</strong> {locationError}
          </div>
        )}

        {error && (
          <div className="error-state">
            <strong>Search Error:</strong> {error}
          </div>
        )}
      </section>

      <div className="metric-grid">
        <MetricCard label="Hospitals found" value={String(hospitals.length)} icon={<MapPin />} />
        <MetricCard label="Status" value="All approved" tone="green" icon={<Stethoscope />} />
      </div>

      <section className="hospitals-grid">
        {loading ? (
          <div className="loading-state">Searching for hospitals...</div>
        ) : hospitals.length === 0 ? (
          <div className="empty-state">
            No hospitals found. Try adjusting your search criteria.
          </div>
        ) : (
          hospitals.map((hospital) => (
            <article key={hospital.id} className="hospital-card">
              <div className="hospital-header">
                <h3>{hospital.name}</h3>
                {(hospital as any).distance && (
                  <span className="distance-badge">{(hospital as any).distance} km</span>
                )}
              </div>

              <div className="hospital-location">
                <MapPin size={16} />
                <span>
                  {hospital.city}, {hospital.state}
                </span>
              </div>

              {hospital.address && (
                <p className="hospital-address">{hospital.address}</p>
              )}

              {hospital.specialties && hospital.specialties.length > 0 && (
                <div className="specialties">
                  <strong>Specialties:</strong>
                  <div className="specialty-tags">
                    {hospital.specialties.slice(0, 3).map((spec) => (
                      <span key={spec} className="specialty-tag">
                        {spec}
                      </span>
                    ))}
                    {hospital.specialties.length > 3 && (
                      <span className="specialty-tag">+{hospital.specialties.length - 3}</span>
                    )}
                  </div>
                </div>
              )}

              {hospital.contactEmail && (
                <div className="hospital-contact">
                  <Phone size={16} />
                  <a href={`mailto:${hospital.contactEmail}`}>{hospital.contactEmail}</a>
                </div>
              )}

              {hospital.connectedPatients !== undefined && (
                <small className="connected-patients">
                  {hospital.connectedPatients} patients connected
                </small>
              )}

              <button className="secondary-button full-width">
                View details
              </button>
            </article>
          ))
        )}
      </section>

      <style>{`
        .hospital-finder-search {
          background: #f9fafb;
          padding: 2rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
        }

        .search-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-inputs {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1rem;
          align-items: flex-end;
        }

        @media (max-width: 768px) {
          .search-inputs {
            grid-template-columns: 1fr;
          }
        }

        .search-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .search-input-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .search-input-group input,
        .search-input-group select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .location-toggle {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .location-toggle label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .location-toggle input[type="checkbox"] {
          cursor: pointer;
        }

        .location-toggle small {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .radius-control {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .radius-control label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .radius-control input[type="range"] {
          width: 100%;
        }

        .hospitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .hospital-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: box-shadow 0.2s;
        }

        .hospital-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .hospital-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 1rem;
        }

        .hospital-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }

        .distance-badge {
          background: #dcfce7;
          color: #166534;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .hospital-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .hospital-address {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .specialties {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .specialties strong {
          font-size: 0.875rem;
          color: #374151;
        }

        .specialty-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .specialty-tag {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          color: #374151;
        }

        .hospital-contact {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .hospital-contact a {
          color: #3b82f6;
          text-decoration: none;
        }

        .hospital-contact a:hover {
          text-decoration: underline;
        }

        .connected-patients {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .full-width {
          width: 100%;
          margin-top: auto;
        }
      `}</style>
    </AppShell>
  );
}
