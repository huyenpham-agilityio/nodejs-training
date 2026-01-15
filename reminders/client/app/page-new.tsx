import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // If user is already signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50'>
      {/* Header */}
      <header className='absolute top-0 left-0 right-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex justify-between items-center'>
            <div className='text-2xl font-bold text-indigo-600'>
              📝 Reminders
            </div>
            <div className='flex gap-4'>
              <Link
                href='/sign-in'
                className='px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors'
              >
                Sign In
              </Link>
              <Link
                href='/sign-up'
                className='px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-lg shadow-indigo-200'
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className='relative'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16'>
          <div className='text-center'>
            <h1 className='text-5xl sm:text-6xl font-bold text-gray-900 mb-6'>
              Never Forget What
              <span className='text-indigo-600'> Matters</span>
            </h1>
            <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
              A simple, elegant way to manage your reminders. Stay organized and
              never miss an important task again.
            </p>
            <div className='flex gap-4 justify-center'>
              <Link
                href='/sign-up'
                className='px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg transition-colors shadow-xl shadow-indigo-200'
              >
                Start Free Trial
              </Link>
              <Link
                href='/sign-in'
                className='px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-lg transition-colors border-2 border-gray-200'
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className='mt-24 grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white p-8 rounded-2xl shadow-lg'>
              <div className='text-4xl mb-4'>🔔</div>
              <h3 className='text-xl font-semibold mb-2'>Smart Reminders</h3>
              <p className='text-gray-600'>
                Set up reminders that work for you, with flexible scheduling
                options.
              </p>
            </div>
            <div className='bg-white p-8 rounded-2xl shadow-lg'>
              <div className='text-4xl mb-4'>🔒</div>
              <h3 className='text-xl font-semibold mb-2'>Secure & Private</h3>
              <p className='text-gray-600'>
                Your data is encrypted and secure with industry-standard
                authentication.
              </p>
            </div>
            <div className='bg-white p-8 rounded-2xl shadow-lg'>
              <div className='text-4xl mb-4'>📱</div>
              <h3 className='text-xl font-semibold mb-2'>Always Accessible</h3>
              <p className='text-gray-600'>
                Access your reminders anywhere, anytime, on any device.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='absolute bottom-0 left-0 right-0 py-6 text-center text-gray-600'>
        <p>© 2026 Reminders App. All rights reserved.</p>
      </footer>
    </div>
  );
}
