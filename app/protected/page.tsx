import { auth } from '@/lib/auth';
import { FileList } from '@/components/FileList';

export default async function ProtectedPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="w-full max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Your Files</h1>
        <FileList userId={session.user.id} />
      </div>
    </div>
  );
}