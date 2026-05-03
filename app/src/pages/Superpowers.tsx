import React, { Suspense, useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from '../components/Navigation';
import FooterSection from '../sections/FooterSection';
import SuspenseLoader from '../components/SuspenseLoader/SuspenseLoader';
import ErrorBoundary from '../components/ErrorBoundary';
import { theme } from '../theme';

// Feature is lazy loaded at the feature entry, but we wrap it in a boundary here
const SuperpowersFeature = React.lazy(() => import('../features/superpowers').then(m => ({ default: m.SuperpowersFeature })));
const ReservationModal = React.lazy(() => import('../components/ReservationModal'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Superpowers Page
 * 
 * Entry point for the /superpowers route.
 * Follows the Suspense-first, feature-based architecture.
 */
const SuperpowersPage: React.FC = () => {
  const [reserveOpen, setReserveOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', color: 'text.primary' }}>
          <Navigation onReserve={() => setReserveOpen(true)} />
          {reserveOpen && (
            <Suspense fallback={null}>
              <ReservationModal open={reserveOpen} onOpenChange={setReserveOpen} />
            </Suspense>
          )}

          <Container maxWidth="lg" sx={{ pt: 20, pb: 10 }}>
            <Box sx={{ mb: 8 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3rem', md: '5rem' },
                  color: 'primary.main',
                  textTransform: 'uppercase',
                  mb: 3,
                  textShadow: '0 0 20px rgba(176,38,255,0.6)'
                }}
              >
                Cybernetic Superpowers
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'monospace',
                  color: 'text.secondary',
                  fontSize: '1.1rem',
                  maxW: '600px'
                }}
              >
                Upgrade your slot experience. Purchase and equip cybernetic enhancements to alter the odds and bend the casino to your will.
              </Typography>
            </Box>

            <ErrorBoundary>
              <Suspense fallback={<SuspenseLoader />}>
                <SuperpowersFeature />
              </Suspense>
            </ErrorBoundary>
          </Container>

          <FooterSection onReserve={() => setReserveOpen(true)} />
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default SuperpowersPage;
