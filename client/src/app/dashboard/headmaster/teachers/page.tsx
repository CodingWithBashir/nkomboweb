import { redirect } from 'next/navigation';

/** The administration area moved to /lyceeadmin/staff. */
export default function MovedPage() {
  redirect('/lyceeadmin/staff');
}
