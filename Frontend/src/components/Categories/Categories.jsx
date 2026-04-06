import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { equipmentAPI } from '../../services/api';
import './Categories.css';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await equipmentAPI.getCategories();
        
        // Ensure response.data is an array
        let categoriesData = [];
        if (response && response.data) {
          categoriesData = Array.isArray(response.data) ? response.data : [];
        }
        
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Showing demo data.');
        
        // Fallback to static data if API fails
        const fallbackData = [
          {
            id: 1,
            name: 'Tractors',
            image: 'https://www.kubota.com/products/tractor/images/img_hero.jpg',
            price: '₹800/day',
            description: 'Perfect for farming'
          },
          {
            id: 2,
            name: 'JCB',
            image: 'https://gsat.jp/wp-content/uploads/jcb-3cx-sitemaster-4x4-backhoe-loader-div5235a-copy.webp',
            price: '₹1200/hour',
            description: 'Ideal for excavation'
          },
          {
            id: 3,
            name: 'Cranes',
            image: 'https://tybinfra.com/wp-content/uploads/2024/02/best-applications-for-tower-cranes-l-reliable-crane.jpg',
            price: '₹2500/hour',
            description: 'Heavy lifting'
          },
          {
            id: 4,
            name: 'Dumpers',
            image: 'https://images.jdmagicbox.com/quickquotes/images_main/tata-dumper-on-rent-2226368989-j2bnre4m.jpg',
            price: '₹1500/hour',
            description: 'Material transport'
          }
        ];
        setCategories(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="categories-loading">Loading categories...</div>;
  }

  // Add a check to ensure categories is an array before rendering
  if (!Array.isArray(categories) || categories.length === 0) {
    return (
      <section className="categories">
        <div className="container">
          <h2 className="section-title">Our Equipment</h2>
          <p className="section-subtitle">Choose from our wide range of heavy equipment</p>
          <div className="no-categories">No categories available at the moment.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="categories">
      <div className="container">
        <h2 className="section-title">Our Equipment</h2>
        <p className="section-subtitle">Choose from our wide range of heavy equipment</p>

        {error && (
          <div className="error-message" style={{ textAlign: 'center', marginBottom: '20px', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        <div className="categories-grid">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="category-card"
              onClick={() => navigate(`/equipment?type=${category.name.toLowerCase()}`)}
            >
              <img src={category.image} alt={category.name} />
              <div className="category-info">
                <h3>{category.name}</h3>
                <p className="category-price">{category.price}</p>
                <p className="category-desc">{category.description}</p>
                <button className="category-btn">View Details →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;