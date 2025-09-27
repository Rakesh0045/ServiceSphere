import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProviderDashboard.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = "http://localhost:5000/api";

// --- Icon Components ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const PowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

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
    const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profileDetails, setProfileDetails] = useState({ name: '', email: '' });
    const [user, setUser] = useState(null);

    const token = localStorage.getItem("token");
    const axiosWithAuth = useMemo(() => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } }), [token]);

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser) {
            setUser(currentUser);
            fetchServices(currentUser.id);
        }
    }, [token, navigate]);

    const fetchServices = async (providerId) => {
        setLoading(true);
        try {
            const res = await axiosWithAuth.get("/services", { params: { provider_id: providerId } });
            setServices(res.data || []);
        } catch (err) {
            toast.error("Failed to fetch services.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosWithAuth.post("/services", { ...form });
            setForm({ service_name: "", description: "", category: "", price: "", availability: "", location: "", image_url: "" });
            fetchServices(user.id);
            toast.success("Service added successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add service.");
        }
    };

    const handleUpdateService = async (e) => {
        e.preventDefault();
        if (!editingService) return;
        try {
            await axiosWithAuth.put(`/services/${editingService.id}`, editingService);
            setIsEditServiceModalOpen(false);
            fetchServices(user.id);
            toast.success("Service updated successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update service.");
        }
    };
    
    const handleDelete = async () => {
        if(!serviceToDelete) return;
        try {
            await axiosWithAuth.delete(`/services/${serviceToDelete.id}`);
            fetchServices(user.id);
            setIsDeleteModalOpen(false);
            toast.success("Service deleted successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete service.");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await axiosWithAuth.put('/users/me', profileDetails);
            const updatedUser = { ...user, ...profileDetails };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setIsProfileEditModalOpen(false);
            toast.success("Profile updated successfully!");
        } catch(err) {
            toast.error(err.response?.data?.message || "Failed to update profile.");
        }
    }

    const handleSignOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login');
    };

    const stats = useMemo(() => ({
        totalServices: services.length,
        availableNow: services.filter(s => s.availability === "Available").length,
        totalEarnings: services.reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0).toFixed(2),
    }), [services]);

    const FALLBACK_CATEGORIES = [ "Plumbing", "Electrical", "Carpentry", "Cleaning", "Painting", "Appliance Repair", "Gardening", "Tutoring", "Other" ];
    const FALLBACK_AVAILABILITIES = [ "Available", "Unavailable", "Busy" ];

    return (
        <div className="main-content-wrapper">
            <ToastContainer theme="dark" position="bottom-right"/>
            <header className="main-header">
                <h1 className="header-title">ProManage Dashboard</h1>
                <div className="header-right">
                    <div className="profile-menu">
                        <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="profile-btn">
                            <span>Welcome, <strong className="gradient-text">{user?.name || 'Provider'}</strong></span>
                        </button>
                        {isProfileDropdownOpen && (
                            <div className="profile-dropdown">
                                <div className="dropdown-header">
                                    <p className="dropdown-name">{user?.name}</p>
                                    <p className="dropdown-email">{user?.email}</p>
                                </div>
                                <button onClick={() => {
                                    setProfileDetails({ name: user.name, email: user.email });
                                    setIsProfileDropdownOpen(false);
                                    setIsProfileEditModalOpen(true);
                                }} className="dropdown-item">
                                    <UserIcon /> Edit Profile
                                </button>
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
                    <form className="add-service-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="service_name">Service Name</label>
                            <input id="service_name" className="form-input" required placeholder="e.g., Expert Plumbing Repair" value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <select id="category" required className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                <option value="">Select Category *</option>
                                {FALLBACK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="form-group full-width">
                             <label htmlFor="description">Description</label>
                            <textarea id="description" className="form-textarea" placeholder="Describe the service you offer..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Price (₹)</label>
                            <input id="price" className="form-input" placeholder="e.g., 500" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                        </div>
                        <div className="form-group">
                             <label htmlFor="availability">Availability</label>
                            <select id="availability" required className="form-select" value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}>
                                <option value="">Select Availability *</option>
                                {FALLBACK_AVAILABILITIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                             <label htmlFor="location">Location</label>
                            <input id="location" className="form-input" placeholder="e.g., Bhubaneswar" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                        </div>
                        <div className="form-group">
                             <label htmlFor="image_url">Image URL (Optional)</label>
                            <input id="image_url" className="form-input" placeholder="https://example.com/image.png" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                        </div>
                        <div className="form-group full-width">
                            <button type="submit" className="btn btn-primary"><PlusIcon /> Add Service</button>
                        </div>
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
                                        <td><span className={`status-badge ${s.availability?.toLowerCase().replace(/\s+/g, "-") || "unavailable"}`}>{s.availability}</span></td>
                                        <td className="actions-cell">
                                            <button className="btn-icon" onClick={() => { setEditingService(s); setIsEditServiceModalOpen(true); }}><EditIcon /></button>
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
            
            {/* --- Modals --- */}
            {isEditServiceModalOpen && editingService && (
                <div className="modal-overlay" onClick={() => setIsEditServiceModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>Edit Service</h3></div>
                        <form onSubmit={handleUpdateService}>
                            <div className="modal-form-grid">
                                <div className="form-group full-width">
                                    <label>Service Name</label>
                                    <input className="form-input" required value={editingService.service_name} onChange={e => setEditingService({ ...editingService, service_name: e.target.value })} />
                                </div>

                                <div className="form-group">
                                    <label>Category</label>
                                    <select className="form-select" required value={editingService.category} onChange={e => setEditingService({ ...editingService, category: e.target.value })}>
                                        {FALLBACK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Availability</label>
                                    <select className="form-select" required value={editingService.availability} onChange={e => setEditingService({ ...editingService, availability: e.target.value })}>
                                        {FALLBACK_AVAILABILITIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input type="number" className="form-input" placeholder="e.g. 500" value={editingService.price || ''} onChange={e => setEditingService({ ...editingService, price: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input type="text" className="form-input" placeholder="e.g. Bhubaneswar" value={editingService.location || ''} onChange={e => setEditingService({ ...editingService, location: e.target.value })} />
                                </div>
                                {/* <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea className="form-textarea" value={editingService.description || ''} onChange={e => setEditingService({ ...editingService, description: e.target.value })} />
                                </div> */}
                                <div className="form-group full-width">
                                    <label>Image URL</label>
                                    <input className="form-input" value={editingService.image_url || ''} onChange={e => setEditingService({ ...editingService, image_url: e.target.value })} />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsEditServiceModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {isDeleteModalOpen && serviceToDelete && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content confirm-delete-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>Confirm Deletion</h3></div>
                        <p>Are you sure you want to delete the service "{serviceToDelete?.service_name}"? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {isProfileEditModalOpen && (
                <div className="modal-overlay" onClick={() => setIsProfileEditModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>Edit Your Profile</h3></div>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required
                                    value={profileDetails.name} 
                                    onChange={(e) => setProfileDetails({...profileDetails, name: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    className="form-input" 
                                    required
                                    value={profileDetails.email} 
                                    onChange={(e) => setProfileDetails({...profileDetails, email: e.target.value})} 
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsProfileEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDashboard;