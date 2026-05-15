import Navbar from "@/components/Navbar";

export default function SearchPage() {
  return (
    <div>
      <Navbar />
      <main className="min-h-screen bg-neutral-100 px-8 py-6">
        <section className="flex flex-col items-center justify-center mt-60">
          <h1 className="text-4xl text-center font-semibold mb-10 tracking-wide">
            Search for a player or team to find the best odds across all sportsbooks
          </h1>

          <input
            type="text"
            placeholder="Search for a player or team..."
            className="
            w-full
            max-w-7xl
            h-20
            rounded-3xl
            border 
            border-gray-200 
            bg-white
            px-8
            text-2xl
            outline-none
            shadow-sm
            transition-all
            focus:scale-[1.01]
          "
          />
        </section>
      </main>
    </div>
  );
}
