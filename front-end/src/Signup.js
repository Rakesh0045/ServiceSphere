import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "./Signup.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // Role can be 'Service Provider' or 'Customer'
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role.", { position: "top-center" });
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/signup", {
        name,
        email,
        password,
        role,
      });
      toast.success(res.data.message, { position: "top-center" });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed", {
        position: "top-center",
      });
    }
  };

  return (
    <>
      <div className="signup-bg">
        <div className="signup-card">
          <h2 className="gradient-text">Create an Account</h2>
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                placeholder="Enter your full name"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                placeholder="Create a strong password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>I am a...</label>
              <div className="role-buttons">
                <button
                  type="button"
                  className={`role-btn ${role === "Service Provider" ? "active-role" : ""}`}
                  onClick={() => setRole("Service Provider")}
                >
                  Service Provider
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === "Customer" ? "active-role" : ""}`}
                  onClick={() => setRole("Customer")}
                >
                  Customer
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn">Sign Up</button>
          </form>

          <p className="switch-text">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
        <ToastContainer theme="dark" />
      </div>
    </>
  );
};

export default Signup;

