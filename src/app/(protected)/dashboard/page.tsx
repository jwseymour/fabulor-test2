import { auth } from '@/lib/auth/auth';
import { Session } from '@/types/auth';
import Link from 'next/link';
import { FileIcon, BookOpen, Settings, User } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth() as Session | null;

  if (!session?.user) {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.username}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here&apos;s an overview of your Fabulor workspace
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Files Card */}
          <Link 
            href="/files" 
            className="group block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <FileIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Files</h2>
                <p className="text-sm text-gray-500">
                  Access and manage your documents
                </p>
              </div>
            </div>
          </Link>

          {/* Stories Card */}
          <Link 
            href="/stories" 
            className="group block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Stories</h2>
                <p className="text-sm text-gray-500">
                  Coming soon: Write and publish stories
                </p>
              </div>
            </div>
          </Link>

          {/* Profile Card */}
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                <p className="text-sm text-gray-500">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Account Created</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Username</p>
              <p className="text-lg font-semibold text-gray-900">
                {session.user.username}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-semibold text-gray-900">Active</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}