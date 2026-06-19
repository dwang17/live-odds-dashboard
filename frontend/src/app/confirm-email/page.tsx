import Link from "next/link";

export default function ConfirmEmailPage() {
  return (
    <main className="min-h-screen mt-30 bg-gray-50 px-6 py-10">
      <section className="mx-auto mt-10 max-w-xl rounded-xl border border-gray-200 bg-white px-12 py-14 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>

        <p className="mt-4 text-gray-600">
          Your account was created, but you need to confirm your email before
          signing in.
        </p>

        <Link
          href="/signin"
          className="mt-8 inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
        >
          Back to sign in
        </Link>
      </section>
    </main>
  );
}