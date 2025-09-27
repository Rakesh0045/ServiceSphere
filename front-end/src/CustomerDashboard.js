import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerDashboard.css";

const API_BASE = "http://localhost:5000/api";

// --- Icon Components ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const PowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>;
const SortIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18M3 8h12M3 12h8M3 16h4"/></svg>;


const CustomerDashboard = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [filters, setFilters] = useState({ keyword: "", category: "", location: "", sortBy: "" });
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    const token = localStorage.getItem("token");
    const payload = useMemo(() => token ? JSON.parse(atob(token.split(".")[1])) : null, [token]);
    const [profileDetails, setProfileDetails] = useState({ name: payload?.name || '', email: payload?.email || '' });
    
    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        
        const fetchServices = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/services`);
                setServices(res.data || []);
            } catch (err) {
                console.error("Error fetching services:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [token, navigate]);

    const filteredServices = useMemo(() => {
        let result = [...services];

        result = result.filter(s => 
            (s.service_name.toLowerCase().includes(filters.keyword.toLowerCase()) || (s.description && s.description.toLowerCase().includes(filters.keyword.toLowerCase()))) &&
            (filters.category ? s.category === filters.category : true) &&
            (filters.location ? (s.location && s.location.toLowerCase().includes(filters.location.toLowerCase())) : true)
        );

        if (filters.sortBy === 'price_asc') {
            result.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
        } else if (filters.sortBy === 'price_desc') {
            result.sort((a, b) => (b.price || 0) - (a.price || 0));
        }

        return result;
    }, [filters, services]);
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate('/login');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const authAxios = axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } });
            await authAxios.put(`/users/${payload.id}`, { name: profileDetails.name });
            alert("Profile updated successfully! New name will appear on next login.");
            setIsProfileModalOpen(false);
        } catch (error) {
            alert("Failed to update profile.");
        }
    }

    const uniqueCategories = useMemo(() => {
        const cats = new Set(services.map(s => s.category).filter(Boolean));
        return ["", ...Array.from(cats)];
    }, [services]);

    const getAvailabilityClass = (availability) => availability?.toLowerCase().replace(/\s+/g, '-') || 'unavailable';

    return (
    <>
    <div className="customer-dashboard">
        <header className="customer-header">
            <div className="logo">ServiceSphere</div>
            <div className="header-right">
                <div className="profile-menu">
                    <button onClick={() => setIsProfileModalOpen(true)} className="profile-btn">
                       <span>Welcome, <strong>{payload?.name || 'Customer'}</strong></span>
                    </button>
                </div>
                 <button className="signout-btn" onClick={handleSignOut}><PowerIcon /> Sign Out</button>
            </div>
        </header>

        <main className="customer-content-area">
            <div className="content-header">
                <h1>Explore Services</h1>
                <p>Find the best professionals for your needs, right in your area.</p>
            </div>

            <div className="filters-panel">
                <div className="filter-input-wrapper">
                    <span className="icon"><SearchIcon/></span>
                    <input type="text" name="keyword" className="filter-input" placeholder="Service (e.g., plumbing)" value={filters.keyword} onChange={handleFilterChange} />
                </div>
                 <div className="filter-input-wrapper">
                    <span className="icon"><MapPinIcon/></span>
                    <input type="text" name="location" className="filter-input" placeholder="Location (City or ZIP)" value={filters.location} onChange={handleFilterChange} />
                </div>
                <div className="filter-input-wrapper">
                    <span className="icon"><TagIcon/></span>
                    <select name="category" className="filter-select" value={filters.category} onChange={handleFilterChange}>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat || 'All Categories'}</option>)}
                    </select>
                </div>
                <div className="filter-input-wrapper">
                    <span className="icon"><SortIcon/></span>
                    <select name="sortBy" className="filter-select" value={filters.sortBy} onChange={handleFilterChange}>
                        <option value="">Sort By</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loader-container"><div className="loader"></div></div>
            ) : filteredServices.length > 0 ? (
                <div className="services-grid">
                {filteredServices.map(s => (
                    <div key={s.id} className="service-card">
                        <div className="card-img-container">
                            <img src={s.image_url || `https://placehold.co/400x250/191925/a99eff?text=${s.service_name.split(' ').map(w => w[0]).join('')}`} alt={s.service_name} className="card-img" />
                            <span className={`availability-badge ${getAvailabilityClass(s.availability)}`}>
                                {s.availability || 'Not Set'}
                            </span>
                        </div>
                        <div className="card-content">
                            <div className="card-header">
                                <h3>{s.service_name}</h3>
                                <p className="service-price">₹{s.price || 'N/A'}</p>
                            </div>
                            <div className="card-meta">
                                <span><TagIcon /> {s.category}</span>
                                <span><MapPinIcon /> {s.location || 'Not specified'}</span>
                            </div>
                            <p className="card-desc">{s.description}</p>
                        </div>
                        <div className="card-footer">
                            <div className="provider-info">
                                <span>Provider</span>
                                <p>{s.provider_name || 'Anonymous'}</p>
                            </div>
                            <button className="details-btn">View Details</button>
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="no-results">
                    <p>No services match your current filters. Try a different search.</p>
                </div>
            )}
        </main>
    </div>

    {isProfileModalOpen && (
    <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Edit Your Profile</h3></div>
            <form onSubmit={handleUpdateProfile}>
                <label>Full Name</label>
                <input type="text" className="form-input" value={profileDetails.name} onChange={(e) => setProfileDetails({...profileDetails, name: e.target.value})} />
                <label>Email Address</label>
                <input type="email" className="form-input" readOnly value={profileDetails.email} style={{ cursor: 'not-allowed', color: 'var(--text-secondary)' }} />
                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setIsProfileModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    </div>
    )}
    </>
    );
};

export default CustomerDashboard;