import { Routes, Route } from 'react-router'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Superpowers from './pages/Superpowers'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/superpowers" element={<Superpowers />} />
      </Routes>
    </ErrorBoundary>
  )
}
