import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    equipment: '',
    location: 'Meerut',
    date: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/equipment', { state: searchData });
  };

  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>Book Heavy Equipment <span className="highlight">in Minutes</span></h1>
        <p>Tractors, JCB, Cranes & Dumpers available in Meerut</p>

        <form className="search-box" onSubmit={handleSearch}>
          <select 
            value={searchData.equipment}
            onChange={(e) => setSearchData({...searchData, equipment: e.target.value})}
            required
          >
            <option value="">Select Equipment</option>
            <option value="tractor">Tractor</option>
            <option value="jcb">JCB</option>
            <option value="crane">Crane</option>
            <option value="dumper">Dumper</option>
          </select>

          <input 
            type="text" 
            placeholder="Location" 
            value={searchData.location}
            onChange={(e) => setSearchData({...searchData, location: e.target.value})}
            readOnly
          />

          <input 
            type="date" 
            value={searchData.date}
            onChange={(e) => setSearchData({...searchData, date: e.target.value})}
            required
          />

          <button type="submit">Search Equipment</button>
        </form>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Equipment</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">1000+</span>
            <span className="stat-label">Happy Clients</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;