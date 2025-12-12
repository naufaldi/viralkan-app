import Header from "components/layout/header";
import NotFoundContent from "components/common/not-found-content";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <NotFoundContent />
        </div>
      </main>
    </div>
  );
}
