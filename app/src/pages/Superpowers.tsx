import { lazy, Suspense, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from '../components/Navigation';
import FooterSection from '../sections/FooterSection';
import SuspenseLoader from '../components/SuspenseLoader/SuspenseLoader';
import ErrorBoundary from '../components/ErrorBoundary';

const SuperpowersFeature = lazy(() => import('../features/superpowers').then((m) => ({ default: m.SuperpowersFeature })));
const ReservationModal = lazy(() => import('../components/ReservationModal'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function SuperpowersPage() {
  const [reserveOpen, setReserveOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen overflow-x-hidden bg-casino-ink text-casino-ivory">
        <Navigation onReserve={() => setReserveOpen(true)} />
        {reserveOpen && (
          <Suspense fallback={null}>
            <ReservationModal open={reserveOpen} onOpenChange={setReserveOpen} />
          </Suspense>
        )}

        <main className="relative px-[6vw] pb-20 pt-32 md:pt-40">
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_20%_15%,rgba(176,38,255,0.22),transparent_30%),radial-gradient(circle_at_80%_25%,rgba(0,255,204,0.12),transparent_28%)]" />
          <div className="relative mx-auto max-w-7xl">
            <section className="mb-12 max-w-4xl">
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-casino-cyber">
                Upgrade Bay / Protocol Store
              </p>
              <h1 className="mt-5 font-serif text-[clamp(3rem,9vw,6.5rem)] uppercase leading-[0.9] text-casino-gold [text-shadow:0_0_28px_rgba(176,38,255,0.42)]">
                Cybernetic Superpowers
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-casino-muted md:text-lg">
                Upgrade your slot experience. Purchase and equip cybernetic enhancements to alter the odds and bend the casino to your will.
              </p>
            </section>

            <ErrorBoundary>
              <Suspense fallback={<SuspenseLoader />}>
                <SuperpowersFeature />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>

        <FooterSection onReserve={() => setReserveOpen(true)} />
        <div className="pointer-events-none fixed inset-0 z-[999] opacity-[0.045] noise-overlay" />
      </div>
    </QueryClientProvider>
  );
}
