import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="container mx-auto px-4 py-32">
          <div className="mx-auto max-w-4xl text=center">
            <h1 className="text-black mb-6 text-6xl font-bold">
              A better way to track potential apartments 
            </h1>
            <p className="text-gray-700 mb-10 text-xl">
              Easy apartment-search, all in one website
            </p>
            <div className="flex flex-col items-center gap-4">
              <Link href="/search">
                <button>Get Started</button>
              </Link>
              
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}