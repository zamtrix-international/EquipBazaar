import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>About EquipNest</h3>
          <p>Your trusted platform for booking heavy equipment in Meerut. Tractors, JCB, Cranes, and Dumpers available 24/7.</p>
          <div className="social-links">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/equipment">Equipment</Link></li>
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Equipment</h3>
          <ul>
            <li><Link to="/equipment?type=tractor">Tractors</Link></li>
            <li><Link to="/equipment?type=jcb">JCB</Link></li>
            <li><Link to="/equipment?type=crane">Cranes</Link></li>
            <li><Link to="/equipment?type=dumper">Dumpers</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Info</h3>
          <ul>
            <li><i className="fas fa-map-marker-alt"></i> Meerut, Uttar Pradesh</li>
            <li><i className="fas fa-phone"></i> +91 98765 43210</li>
            <li><i className="fas fa-envelope"></i> info@equipnest.com</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 EquipNest. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;