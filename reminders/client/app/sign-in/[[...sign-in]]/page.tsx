import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100'>
      <div className='w-full max-w-md p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            Welcome Back
          </h1>
          <p className='text-gray-600'>Sign in to manage your reminders</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl",
            },
          }}
        />
      </div>
    </div>
  );
}
