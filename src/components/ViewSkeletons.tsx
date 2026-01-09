"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const HomeSkeleton = () => (
  <div className="space-y-12 py-6 animate-pulse">
    <div className="w-full rounded-[2rem] bg-white/5 aspect-[21/7]" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-6 w-32 bg-white/5 rounded" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-4 p-3">
            <div className="w-8 h-4 bg-white/5 rounded" />
            <div className="w-12 h-12 bg-white/5 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-white/5 rounded" />
              <div className="h-3 w-1/4 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-6 w-32 bg-white/5 rounded" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 w-full bg-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);

export const SearchSkeleton = () => (
  <div className="space-y-8 pt-4 animate-pulse">
    <div className="h-14 w-full max-w-2xl mx-auto bg-white/5 rounded-2xl" />
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-10 w-24 bg-white/5 rounded-full" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="h-16 bg-white/5 rounded-2xl" />
      ))}
    </div>
  </div>
);