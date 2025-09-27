import { Link } from "react-router-dom";
import { ShieldCheck, Calendar, CreditCard } from "lucide-react";
import "./Home.css";

const Home = () => {
  return (
    <>
      <div className="home-container">
        {/* --- Navigation Bar --- */}
        <header className="main-header">
          <nav className="main-nav container">
            <div className="logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>ServiceSphere</span>
            </div>
            <div className="nav-auth-links">
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </div>
          </nav>
        </header>

        {/* --- Main Hero Section --- */}
        <main className="hero-section">
          <div className="container">
            <h1 className="hero-heading">
              Find & Book <span className="gradient-text">Trusted Local Services</span>
            </h1>
            <p className="hero-tagline">
              Discover and book trusted local services - fast, simple and reliable.
            </p>
            <div className="hero-cta-group">
              <Link to="/signup">
                <button className="btn btn-hero-primary">Get Started Now</button>
              </Link>
            </div>
          </div>
        </main>

        {/* --- Features Section --- */}
        <section className="features-section" id="features">
          <div className="container">
            <h2 className="section-title">
              Why Choose <span className="gradient-text">ServiceSphere?</span>
            </h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <ShieldCheck size={40} />
                </div>
                <h3>Verified Professionals</h3>
                <p>Every service provider on our platform is vetted for quality, reliability, and professionalism.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Calendar size={40} />
                </div>
                <h3>Seamless Booking</h3>
                <p>Check availability and book services in just a few clicks with our intuitive scheduling system.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <CreditCard size={40} />
                </div>
                <h3>Secure Payments</h3>
                <p>Pay for services securely through our encrypted platform. No cash, no hassle.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;