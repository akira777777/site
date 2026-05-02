import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router'
import ErrorBoundary from './components/ErrorBoundary'
import SuspenseLoader from './components/SuspenseLoader/SuspenseLoader'

const Home = lazy(() => import('./pages/Home'))
const Superpowers = lazy(() => import('./pages/Superpowers'))

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SuspenseLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/superpowers" element={<Superpowers />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
