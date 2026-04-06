// components/ScrollToAnchor/ScrollToAnchor.jsx
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToAnchor = () => {
  const { hash, pathname } = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    // पहिल्या रेंडरवर स्क्रोल करू नका
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    // जर hash असेल तर
    if (hash) {
      // थोडा विलंब जेणेकरून कंपोनेंट पूर्ण लोड होईल
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else {
      // जर hash नसेल तर पेजच्या वरती स्क्रोल करा
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash, pathname]);

  return null;
};

export default ScrollToAnchor;