import { redirect } from 'next/navigation'
import { isAdminUser } from '@/lib/admin-auth'
import VerificationsClient from './VerificationsClient'

export default async function VerificationsPage() {
  if (!(await isAdminUser())) redirect('/')
  return <VerificationsClient />
}