import { redirect } from 'next/navigation';

/**
 * Root page - Redirects to welcome screen
 * Requirements: 1.1
 */
export default function Home() {
  redirect('/welcome');
}
