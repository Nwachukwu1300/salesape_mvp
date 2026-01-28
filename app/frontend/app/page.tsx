import BusinessOnboarding from './components/BusinessOnboarding';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 font-sans dark:from-black dark:to-zinc-900 py-12 px-4">
      <main className="flex w-full justify-center">
        <BusinessOnboarding />
      </main>
    </div>
  );
}
