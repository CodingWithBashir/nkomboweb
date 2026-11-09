import { redirect } from 'next/navigation';

/** The administration area moved to /lyceeadmin/settings. */
export default function MovedPage() {
  redirect('/lyceeadmin/settings');
}
