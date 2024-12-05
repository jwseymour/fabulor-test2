import { auth } from '@/lib/auth/auth';
import { FileList } from '@/components/file-system/FileList';
import { Session } from '@/types/auth';

export default async function ProtectedPage() {
  const session = await auth() as Session | null;

  if (!session?.user) {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-white">
      <FileList userId={session.user.id} />
    </div>
  );
}