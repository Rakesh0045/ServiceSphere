import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import './MyBookings.css'; 

const API_BASE = "http://localhost:5000/api";

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const axiosWithAuth = useMemo(() => axios.create({ baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } }), [token]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        const currentUser = JSON.parse(localStorage.getItem("user"));
        setUser(currentUser);

        const fetchBookings = async () => {
            setLoading(true);
            try {
                const res = await axiosWithAuth.get('/bookings');
                setBookings(res.data);
            } catch (error) {
                toast.error("Failed to fetch your bookings.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [token, navigate, axiosWithAuth]);

    const getStatusClass = (status) => {
        return status ? status.toLowerCase() : '';
    }
    
    return (
        <div className="my-bookings-page">
            <ToastContainer theme="dark" position="bottom-right" />
            <header className="bookings-header">
                <div className="logo">ServiceSphere</div>
                <button className="back-btn" onClick={() => navigate(`/${user?.role}`)}>
                    &larr; Back to Dashboard
                </button>
            </header>
            <main className="bookings-container">
                <h1>My Bookings</h1>
                <p>Here is a list of all your scheduled appointments.</p>

                <div className="bookings-list">
                    {loading ? (
                        <p>Loading bookings...</p>
                    ) : bookings.length > 0 ? (
                        bookings.map(booking => (
                            <div key={booking.id} className="booking-card">
                                <div className="booking-card-header">
                                    <h3>{booking.service_name}</h3>
                                    <span className={`booking-status ${getStatusClass(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="booking-card-body">
                                    <p><strong>{user?.role === 'customer' ? 'Provider' : 'Customer'}:</strong> {user?.role === 'customer' ? booking.provider_name : booking.customer_name}</p>
                                    <p><strong>Date & Time:</strong> {format(new Date(booking.booking_start_time), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</p>
                                    <p><strong>Price:</strong> ₹{booking.price || 'N/A'}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-bookings">
                           <p>You have no bookings yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyBookings;