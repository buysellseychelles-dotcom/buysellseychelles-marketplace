import { redirect } from 'next/navigation'

// The promote flow has been replaced by the self-serve banner page.
// Keep this route working for any old links / bookmarks.
export default function PromotePage() {
  redirect('/advertise')
}
