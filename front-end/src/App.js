import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Home from "./Home";
import CustomerDashboard from "./CustomerDashboard";
import ProviderDashboard from "./ProviderDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/provider" element={<ProviderDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
