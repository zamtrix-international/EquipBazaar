// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import './EquipmentCard.css';

// const EquipmentCard = ({ equipment }) => {
//   const navigate = useNavigate();

//   return (
//     <div className="equipment-card" onClick={() => navigate(`/equipment/${equipment.id}`)}>
//       <div className="equipment-image">
//         <img src={equipment.image} alt={equipment.name} />
//         {!equipment.available && (
//           <span className="badge unavailable">Not Available</span>
//         )}
//       </div>
      
//       <div className="equipment-details">
//         <h3>{equipment.name}</h3>
        
//         <div className="rating">
//           {[...Array(5)].map((_, i) => (
//             <span key={i} className={i < equipment.rating ? 'star filled' : 'star'}>★</span>
//           ))}
//           <span className="review-count">({equipment.reviews} reviews)</span>
//         </div>

//         <div className="pricing">
//           <p className="hourly-rate">₹{equipment.hourlyRate}/hour</p>
//           <p className="daily-rate">₹{equipment.dailyRate}/day</p>
//         </div>

//         <div className="vendor-info">
//           <span className="vendor-name">{equipment.vendor}</span>
//           <span className="location">{equipment.location}</span>
//         </div>

//         <button 
//           className={`book-btn ${!equipment.available ? 'disabled' : ''}`}
//           disabled={!equipment.available}
//           onClick={(e) => {
//             e.stopPropagation();
//             if (equipment.available) {
//               navigate(`/customer/book/${equipment.id}`);
//             }
//           }}
//         >
//           {equipment.available ? 'Book Now' : 'Not Available'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default EquipmentCard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EquipmentCard.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const EQUIPMENT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Crect x='180' y='90' width='240' height='160' rx='16' fill='%23d1d5db'/%3E%3Ccircle cx='255' cy='155' r='24' fill='%239ca3af'/%3E%3Cpath d='M200 230l60-50 45 35 45-55 50 70' fill='none' stroke='%236b7280' stroke-width='18' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ctext x='300' y='315' text-anchor='middle' font-family='Arial' font-size='28' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";

const getCachedEquipmentImage = (equipmentId) => {
  try {
    const cache = JSON.parse(window.localStorage.getItem('equipmentImageCache') || '{}');
    return equipmentId ? cache[String(equipmentId)] || '' : '';
  } catch {
    return '';
  }
};

const resolveEquipmentImage = (equipment = {}) => {
  const rawImage =
    equipment.images?.[0]?.url ||
    equipment.images?.[0]?.imageUrl ||
    equipment.image ||
    equipment.imageUrl ||
    equipment.thumbnail ||
    getCachedEquipmentImage(equipment.id) ||
    '';

  if (!rawImage) return EQUIPMENT_PLACEHOLDER;
  if (/^https?:\/\//i.test(rawImage) || rawImage.startsWith('data:')) return rawImage;

  const normalizedPath = String(rawImage).replace(/\\/g, '/');
  if (/^[a-zA-Z]:\//.test(normalizedPath)) return getCachedEquipmentImage(equipment.id) || EQUIPMENT_PLACEHOLDER;

  return normalizedPath.startsWith('/')
    ? `${API_BASE_URL}${normalizedPath}`
    : `${API_BASE_URL}/${normalizedPath}`;
};

const EquipmentCard = ({ equipment }) => {
  const navigate = useNavigate();
  const isAvailable = equipment?.isActive !== false;
  const equipmentName = equipment?.name || equipment?.title || 'Equipment';
  const rating = Number(equipment?.ratingAvg ?? equipment?.rating ?? 0);
  const reviewCount = Number(equipment?.ratingCount ?? equipment?.reviews ?? 0);
  const vendorName =
    equipment?.vendor?.businessName ||
    equipment?.vendor?.ownerName ||
    equipment?.vendor?.name ||
    equipment?.vendor ||
    'EquipBazaar Vendor';
  const location = equipment?.locationText || equipment?.location || equipment?.city || 'Meerut';

  return (
    <div className="equipment-card" onClick={() => navigate(`/equipment/${equipment.id}`)}>
      <div className="equipment-image">
        <img
          src={resolveEquipmentImage(equipment)}
          alt={equipmentName}
          onError={(e) => {
            e.currentTarget.src = getCachedEquipmentImage(equipment.id) || EQUIPMENT_PLACEHOLDER;
          }}
        />
        {!isAvailable && (
          <span className="badge unavailable">Not Available</span>
        )}
      </div>
      
      <div className="equipment-details">
        <h3>{equipmentName}</h3>
        
        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < Math.round(rating) ? 'star filled' : 'star'}>★</span>
          ))}
          <span className="review-count">({reviewCount} reviews)</span>
        </div>

        <div className="pricing">
          <p className="hourly-rate">₹{Number(equipment?.hourlyRate || 0)}/hour</p>
          <p className="daily-rate">₹{Number(equipment?.dailyRate || equipment?.hourlyRate || 0)}/day</p>
        </div>

        <div className="vendor-info">
          <span className="vendor-name">{vendorName}</span>
          <span className="location">{location}</span>
        </div>

        <button
          className={`book-btn ${!isAvailable ? 'disabled' : ''}`}
          disabled={!isAvailable}
          onClick={(e) => {
            e.stopPropagation();
            if (isAvailable) {
              navigate(`/equipment/${equipment.id}`);
            }
          }}
        >
          {isAvailable ? 'Book Now' : 'Not Available'}
        </button>
      </div>
    </div>
  );
};

export default EquipmentCard;