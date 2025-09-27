import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProviderDashboard.css";

const API_BASE = "http://localhost:5000/api";

const FALLBACK_CATEGORIES = [ "Plumbing", "Electrical", "Carpentry", "Cleaning", "Painting", "Appliance Repair", "Gardening", "Tutoring", "Other" ];
const FALLBACK_AVAILABILITIES = [ "Available", "Unavailable", "Busy" ];

// --- Icon Components ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const PowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

const StatCard = ({ icon, title, value, color }) => (
    <div className="stat-card">
        <div className="stat-icon" style={{ background: color }}>{icon}</div>
        <div className="stat-info">
            <span className="stat-title">{title}</span>
            <span className="stat-value">{value}</span>
        </div>
    </div>
);

const ProviderDashboard = () => {
    const [services, setServices] = useState([]);
    const navigate = useNavigate();

    const [form, setForm] = useState({ service_name: "", description: "", category: "", price: "", availability: "", location: "", image_url: "" });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");
    const payload = useMemo(() => token ? JSON.parse(atob(token.split(".")[1])) : null, [token]);

    useEffect(() => {
        if (!token || !payload?.id) { navigate('/login'); return; }
        fetchServices();
    }, [payload?.id, token, navigate]);

    const axiosWithAuth = () => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } });

    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await axiosWithAuth().get("/services", { params: { provider_id: payload.id } });
            setServices(res.data || []);
        } catch (err) {
            setError("Failed to fetch services.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await axiosWithAuth().post("/services", form);
            setForm({ service_name: "", description: "", category: "", price: "", availability: "", location: "", image_url: "" });
            fetchServices();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add service.");
        }
    };

    const handleUpdateService = async (e) => {
        e.preventDefault();
        if (!editingService) return;
        try {
            await axiosWithAuth().put(`/services/${editingService.id}`, editingService);
            setIsModalOpen(false);
            fetchServices();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update service.");
        }
    };
    
    const handleDelete = async () => {
        if(!serviceToDelete) return;
        try {
            await axiosWithAuth().delete(`/services/${serviceToDelete.id}`);
            fetchServices();
            setIsDeleteModalOpen(false);
        } catch (err) {
            setError("Failed to delete service.");
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate('/login');
    };

    const stats = useMemo(() => ({
        totalServices: services.length,
        availableNow: services.filter(s => s.availability === "Available").length,
        totalEarnings: services.reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0).toFixed(2),
    }), [services]);
    
    const getAvailabilityClass = (availability) => availability?.toLowerCase().replace(/\s+/g, "-") || "unavailable";

    return (
    <div className="provider-dashboard">
        <aside className="sidebar">
            <div className="sidebar-logo">ProManage</div>
            <nav className="sidebar-nav">
                <a href="#" className="nav-item active"><DashboardIcon /> Dashboard</a>
            </nav>
        </aside>

        <div className="main-content-wrapper">
            <header className="main-header">
                <h1 className="header-title">Dashboard</h1>
                <div className="header-right">
                    <div className="profile-menu">
                        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="profile-btn">
                            <span>Welcome, <strong>{payload?.name || 'Provider'}</strong></span>
                        </button>
                        {isProfileOpen && (
                            <div className="profile-dropdown">
                                <div className="dropdown-header">
                                    <p className="dropdown-name">{payload?.name}</p>
                                    <p className="dropdown-email">{payload?.email}</p>
                                </div>
                                <button onClick={handleSignOut} className="dropdown-item">
                                    <PowerIcon /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="content-area">
                <div className="stats-grid">
                    <StatCard icon={<DashboardIcon />} title="Total Services" value={stats.totalServices} color="var(--primary-color)" />
                    <StatCard icon={<CheckCircleIcon />} title="Available Services" value={stats.availableNow} color="var(--success-color)" />
                    <StatCard icon={<DollarSignIcon />} title="Potential Earnings" value={`₹${stats.totalEarnings}`} color="var(--warning-color)" />
                </div>

                <section className="content-panel">
                    <h3 className="panel-header"><PlusIcon /> Add New Service</h3>
                    {error && <div className="error-msg">{error}</div>}
                    <form className="service-form" onSubmit={handleSubmit}>
                        <input className="form-input full-width" required placeholder="Service name *" value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} />
                        <textarea className="form-textarea full-width" placeholder="Short description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        <div className="form-grid">
                            <select required className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                <option value="">Select Category *</option>
                                {FALLBACK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <input className="form-input" placeholder="Price (₹)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                        </div>
                        <div className="form-grid">
                            <select required className="form-select" value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}>
                                <option value="">Select Availability *</option>
                                {FALLBACK_AVAILABILITIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <input className="form-input" placeholder="Location (e.g. Bhubaneswar)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                        </div>
                         <input className="form-input full-width" placeholder="Image URL (optional)" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                        <button type="submit" className="btn btn-primary full-width"><PlusIcon /> Add Service</button>
                    </form>
                </section>

                <section className="content-panel">
                    <h3 className="panel-header">Your Service Listings</h3>
                    <div className="table-wrapper">
                        {loading ? <p>Loading...</p> : services.length === 0 ? <p>No services yet. Add one above.</p> : (
                        <table className="services-table">
                            <thead>
                                <tr><th>Service</th><th>Category</th><th>Price</th><th>Availability</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                            {services.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div className="service-name-cell">
                                            <img src={s.image_url || `https://placehold.co/100x100/10101a/a99eff?text=${s.service_name.charAt(0)}`} alt={s.service_name}/>
                                            <span>{s.service_name}</span>
                                        </div>
                                    </td>
                                    <td>{s.category}</td>
                                    <td>₹{s.price || 'N/A'}</td>
                                    <td><span className={`status-badge ${getAvailabilityClass(s.availability)}`}>{s.availability}</span></td>
                                    <td className="actions-cell">
                                        <button className="btn-icon" onClick={() => { setEditingService(s); setIsModalOpen(true); }}><EditIcon /></button>
                                        <button className="btn-icon btn-icon-danger" onClick={() => { setServiceToDelete(s); setIsDeleteModalOpen(true); }}><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        )}
                    </div>
                </section>
            </main>
        </div>

        {isModalOpen && editingService && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>Edit Service</h3></div>
                <form onSubmit={handleUpdateService}>
                    {/* Simplified Form Layout for Modal */}
                    <label>Service Name</label>
                    <input className="form-input" required value={editingService.service_name} onChange={e => setEditingService({ ...editingService, service_name: e.target.value })} />
                    <label>Description</label>
                    <textarea className="form-textarea" value={editingService.description || ''} onChange={e => setEditingService({ ...editingService, description: e.target.value })} />
                    <label>Image URL</label>
                    <input className="form-input" value={editingService.image_url || ''} onChange={e => setEditingService({ ...editingService, image_url: e.target.value })} />
                    {/* Other fields can be added similarly */}
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
        )}
        
        {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
            <div className="modal-content confirm-delete-modal">
                <div className="modal-header"><h3>Confirm Deletion</h3></div>
                <p>Are you sure you want to delete the service "{serviceToDelete?.service_name}"? This action cannot be undone.</p>
                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                </div>
            </div>
        </div>
        )}
    </div>
    );
};

export default ProviderDashboard;