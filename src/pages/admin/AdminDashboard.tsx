import { Routes, Route } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import PackagesView from './PackagesView'
import ReportsView from './ReportsView'
import StaffView from './StaffView'
import AgendaView from '../receptionist/AgendaView'
import PatientsView from '../receptionist/PatientsView'

export default function AdminDashboard() {
  return (
    <AppShell>
      <Routes>
        <Route index element={<AgendaView />} />
        <Route path="pacientes" element={<PatientsView />} />
        <Route path="staff" element={<StaffView />} />
        <Route path="paquetes" element={<PackagesView />} />
        <Route path="reportes" element={<ReportsView />} />
      </Routes>
    </AppShell>
  )
}
