import { redirect } from 'next/navigation'
import { isAdminUser } from '@/lib/admin-auth'
import BannersClient from './BannersClient'

export default async function BannersPage() {
  if (!(await isAdminUser())) redirect('/')
  return <BannersClient />
}