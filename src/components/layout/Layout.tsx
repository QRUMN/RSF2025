import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

const Layout: React.FC = () => {
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Show footer when within 100px of bottom
      const isNearBottom = windowHeight + scrollTop >= documentHeight - 100;
      setIsFooterVisible(isNearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-base text-base">
      <Header />
      <main className="flex-grow scroll-container">
        <Outlet />
      </main>
      <Footer className={`footer-transition ${isFooterVisible ? 'footer-visible' : 'footer-hidden'}`} />
    </div>
  );
};

export default Layout;