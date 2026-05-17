import { Routes, Route } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import AgendaView from './AgendaView'
import PatientsView from './PatientsView'

export default function ReceptionistDashboard() {
  return (
    <AppShell>
      <Routes>
        <Route index element={<AgendaView />} />
        <Route path="pacientes" element={<PatientsView />} />
      </Routes>
    </AppShell>
  )
}
