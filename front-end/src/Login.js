// Login.js

import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Keep useNavigate
import { ToastContainer, toast } from "react-toastify";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Use the hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      toast.success(res.data.message, { position: "top-center" });

      // Store token and user object
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user)); // Store user details

      // Redirect based on role
      if (res.data.user.role === "Service Provider") {
        navigate("/provider");
      } else if (res.data.user.role === "Admin") {
        navigate("/admin");
      } else {
        navigate("/customer");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed", {
        position: "top-center",
      });
    }
  };

  return (
    <>
      <div className="login-bg">
        <div className="login-card">
          <h2 className="gradient-text">Welcome Back</h2>
          <form className="login-form" onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-btn">Login</button>
          </form>

          <p className="switch-text">
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
        <ToastContainer theme="dark" />
      </div>
    </>
  );
};

export default Login;
