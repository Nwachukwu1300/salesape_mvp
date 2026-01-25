import LeadForm from './components/LeadForm';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black py-12 px-4">
      <main className="flex w-full max-w-3xl flex-col items-center">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            SalesAPE MVP
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Capture and manage your leads
          </p>
        </div>

        <LeadForm />
      </main>
    </div>
  );
}
