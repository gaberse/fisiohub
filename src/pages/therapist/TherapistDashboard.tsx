import { Routes, Route } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import MySessionsView from './MySessionsView'

export default function TherapistDashboard() {
  return (
    <AppShell>
      <Routes>
        <Route index element={<MySessionsView />} />
      </Routes>
    </AppShell>
  )
}
