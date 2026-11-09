import { redirect } from 'next/navigation';

/** The administration area moved to /lyceeadmin. */
export default function MovedPage() {
  redirect('/lyceeadmin');
}
