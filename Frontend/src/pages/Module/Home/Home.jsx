// pages/Module/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../../../components/HeroSection/HeroSection';
import Categories from '../../../components/Categories/Categories';
import { equipmentAPI } from '../../../services/api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedEquipment = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await equipmentAPI.getFeatured();
        
        // Ensure response.data is an array
        let equipmentData = [];
        if (response && response.data) {
          equipmentData = Array.isArray(response.data) ? response.data : [];
        }
        
        setFeaturedEquipment(equipmentData);
      } catch (error) {
        console.error('Error fetching featured equipment:', error);
        setError('Failed to load featured equipment. Showing demo data.');
        
        // Fallback to mock data if API fails
        const mockData = [
          { id: 1, name: 'JCB 3DX', hourlyRate: 1200, image: 'https://source.unsplash.com/400x300/?construction,jcb&1' },
          { id: 2, name: 'Tractor', hourlyRate: 800, image: 'https://source.unsplash.com/400x300/?construction,tractor&2' },
          { id: 3, name: 'Crane', hourlyRate: 2500, image: 'https://source.unsplash.com/400x300/?construction,crane&3' },
          { id: 4, name: 'Dumper', hourlyRate: 1500, image: 'https://source.unsplash.com/400x300/?construction,dumper&4' }
        ];
        setFeaturedEquipment(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEquipment();
  }, []);

  const handleBookNow = (equipmentId) => {
    navigate(`/equipment/${equipmentId}`);
  };
  
  return (
    <div className="home">
      <HeroSection />
      <Categories />
      
      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Book equipment in three simple steps</p>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">1</div>
              <h3>Search Equipment</h3>
              <p>Browse through our wide range of heavy equipment in Meerut</p>
            </div>
            
            <div className="step-card">
              <div className="step-icon">2</div>
              <h3>Book & Pay</h3>
              <p>Select dates and make secure online payment</p>
            </div>
            
            <div className="step-card">
              <div className="step-icon">3</div>
              <h3>Start Working</h3>
              <p>Equipment delivered to your site. Start your project</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Equipment */}
      <section className="featured">
        <div className="container">
          <h2 className="section-title">Featured Equipment</h2>
          <p className="section-subtitle">Most booked equipment in Meerut</p>
          
          {loading ? (
            <div className="loading">Loading featured equipment...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : featuredEquipment.length === 0 ? (
            <div className="no-data">No equipment available at the moment.</div>
          ) : (
            <div className="featured-grid">
              {featuredEquipment.map((equipment) => (
                <div key={equipment.id} className="featured-card">
                  <img 
                    src={equipment.image || `https://source.unsplash.com/400x300/?construction,equipment&${equipment.id}`} 
                    alt={equipment.name} 
                  />
                  <div className="featured-content">
                    <h3>{equipment.name}</h3>
                    <p className="price">₹{equipment.hourlyRate}/hour</p>
                    <button className="btn-book" onClick={() => handleBookNow(equipment.id)}>Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p>"Excellent service! Got JCB on time for our project."</p>
              <h4>- Rajesh Kumar</h4>
              <span>Builder, Meerut</span>
            </div>
            <div className="testimonial-card">
              <p>"Very reasonable rates and well-maintained equipment."</p>
              <h4>- Amit Singh</h4>
              <span>Contractor</span>
            </div>
            <div className="testimonial-card">
              <p>"Best platform for renting heavy equipment in Meerut."</p>
              <h4>- Vikas Sharma</h4>
              <span>Farmer</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;