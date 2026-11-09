import { redirect } from 'next/navigation';

/** The administration area moved to /lyceeadmin/students. */
export default function MovedPage() {
  redirect('/lyceeadmin/students');
}
