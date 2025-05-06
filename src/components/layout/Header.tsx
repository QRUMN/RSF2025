import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, User, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
  };

  const handleJoinClick = () => {
    navigate('/onboarding');
    setIsMenuOpen(false);
  };

  const handleSignInClick = () => {
    setAuthMode('sign-in');
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-base/90 backdrop-blur-sm shadow-soft py-2' : 'bg-transparent py-4'
        }`}
      >
        <Container>
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center space-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <img 
                src="https://github.com/QRUMN/RSFIMG/blob/main/RSF_IconOnly_FullColor%20(1).png?raw=true"
                alt="RSF Logo"
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink href="/" active={location.pathname === "/"}>Home</NavLink>
              <NavLink href="/community" active={location.pathname === "/community"}>Community</NavLink>
              <NavLink href="/services" active={location.pathname === "/services"}>Services</NavLink>
              <NavLink href="/pricing" active={location.pathname === "/pricing"}>Pricing</NavLink>

            </nav>
            
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    leftIcon={<User className="w-4 h-4" />}
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    leftIcon={<LogOut className="w-4 h-4" />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSignInClick}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    leftIcon={<LogIn className="w-4 h-4" />}
                    onClick={handleJoinClick}
                  >
                    Join Now
                  </Button>
                </>
              )}
            </div>
            
            <button 
              className="md:hidden p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
          
          {isMenuOpen && (
            <div className="mobile-menu-overlay">
              <Container>
                <div className="flex flex-col space-y-4 py-6">
                  <MobileNavLink href="/" onClick={toggleMenu}>Home</MobileNavLink>
                  <MobileNavLink href="/community" onClick={toggleMenu}>Community</MobileNavLink>
                  
                  <MobileNavLink href="/services" onClick={toggleMenu}>Services</MobileNavLink>
                  <MobileNavLink href="/pricing" onClick={toggleMenu}>Pricing</MobileNavLink>
                  <div className="pt-4 flex flex-col space-y-3">
                    {user ? (
                      <>
                        <Button 
                          variant="outline" 
                          fullWidth
                          leftIcon={<User className="w-4 h-4" />}
                          onClick={() => {
                            navigate('/dashboard');
                            setIsMenuOpen(false);
                          }}
                        >
                          Dashboard
                        </Button>
                        <Button 
                          variant="ghost" 
                          fullWidth
                          leftIcon={<LogOut className="w-4 h-4" />}
                          onClick={handleLogout}
                        >
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          fullWidth
                          onClick={handleSignInClick}
                        >
                          Sign In
                        </Button>
                        <Button 
                          variant="primary" 
                          fullWidth 
                          leftIcon={<LogIn className="w-4 h-4" />}
                          onClick={handleJoinClick}
                        >
                          Join Now
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Container>
            </div>
          )}
        </Container>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
      />
    </>
  );
};

interface NavLinkProps {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, active, children }) => {
  return (
    <Link
      to={href}
      className={`font-medium text-base transition-colors duration-200 ${
        active ? 'text-primary' : 'text-light hover:text-primary'
      }`}
    >
      {children}
    </Link>
  );
};

interface MobileNavLinkProps {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ href, onClick, children }) => {
  return (
    <Link
      to={href}
      className="block py-2 text-lg font-medium hover:text-primary transition-colors duration-200"
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Header;

export { Header }