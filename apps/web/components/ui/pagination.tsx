import { Button } from "@repo/ui/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push(-1, totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-md border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-400"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Sebelumnya</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {getVisiblePages().map((page, index) => {
          if (page === -1) {
            return (
              <div key={`dots-${index}`} className="px-2">
                <MoreHorizontal className="h-4 w-4 text-neutral-400" />
              </div>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={
                currentPage === page
                  ? "rounded-md bg-neutral-800 text-white hover:bg-neutral-900"
                  : "rounded-md border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
              }
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-md border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-400"
      >
        <span className="mr-1 hidden sm:inline">Selanjutnya</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
