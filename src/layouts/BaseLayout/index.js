import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const ROLE_DASHBOARDS = {
  admin: '/dashboards/Admin',
  coordinator: '/coordinator/dashboard',
  beneficiary: '/beneficiary/dashboard',
};

// Pages that should NOT trigger automatic redirects
const AUTH_PAGES = [
  '/',
  '/admin-login',
  '/coordinator-login', 
  '/beneficiary-login',
  '/register',
  '/beneficiary-register',
];

// Also exclude status pages AND RSBSA routes
const EXCLUDED_PATHS = [
  ...AUTH_PAGES,
  '/status/404',
  '/status/500',
  '/status/maintenance', 
  '/status/coming-soon',
  '/beneficiary/RSBSA_FORM',  // ✅ ADD THIS - RSBSA form route
  '/beneficiary/rsbsa'        // ✅ ADD THIS - RSBSA management route
];

const BaseLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('BaseLayout - Current path:', location.pathname);
    
    // Skip redirect logic for auth pages and excluded paths
    if (EXCLUDED_PATHS.includes(location.pathname)) {
      console.log('BaseLayout - Path excluded, skipping redirect');
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    console.log('BaseLayout - Auth check:', { hasToken: !!token, hasUser: !!userStr });
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = user.role;
        
        console.log('BaseLayout - User role:', role);
        
        if (role && ROLE_DASHBOARDS[role]) {
          // Only redirect if we're not already on the correct dashboard route
          const targetDashboard = ROLE_DASHBOARDS[role];
          const currentSection = '/' + location.pathname.split('/')[1]; // e.g., '/beneficiary'
          const targetSection = '/' + targetDashboard.split('/')[1]; // e.g., '/beneficiary'
          
          console.log('BaseLayout - Sections:', { current: currentSection, target: targetSection });
          
          // Don't redirect if we're already in the correct section
          if (currentSection !== targetSection) {
            console.log(`BaseLayout: Redirecting ${role} from ${location.pathname} to ${targetDashboard}`);
            navigate(targetDashboard, { replace: true });
          } else {
            console.log('BaseLayout - Already in correct section, no redirect needed');
          }
        }
      } catch (error) {
        console.error('Error parsing user data in BaseLayout:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('userRole');
      }
    }
  }, [navigate, location.pathname]);

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
      }}
    >
      {children || <Outlet />}
    </Box>
  );
};

BaseLayout.propTypes = {
  children: PropTypes.node,
};

export default BaseLayout;