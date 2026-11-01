import { Card, Skeleton } from '@repo/ui';

export function BookingSkeleton() {
  return (
    <div>
      {/* Business Showcase Skeleton */}
      <BusinessShowcaseSkeleton />

      {/* Main Content */}
      <div className="max-w-[90rem] mx-auto px-4 md:px-6 py-4 md:py-8 pb-24 md:pb-8">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Main Content Column */}
          <div className="col-span-12 lg:col-span-8">
            <div className="space-y-6">
              {/* Step Indicator - Desktop Only */}
              <div className="hidden md:block">
                <StepIndicatorSkeleton />
              </div>

              {/* Step Content Skeleton */}
              <StepContentSkeleton />

              {/* Navigation Buttons - Desktop */}
              <div className="hidden md:flex mt-8 pt-6 justify-between items-center">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block col-span-12 lg:col-span-4">
            <BookingSidebarSkeleton />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 z-20 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          {/* Summary Info */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessShowcaseSkeleton() {
  return (
    <div className="max-w-[90rem] mx-auto px-4 md:px-6">
      {/* Business Name and Actions */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex-1">
          <Skeleton className="h-8 w-48 md:h-10" />
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Images Gallery */}
      <div className="mb-4 md:mb-8">
        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-4 gap-1 h-[420px] rounded-xl overflow-hidden">
          {/* Main Image - Left Side */}
          <div className="col-span-2 relative overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>

          {/* Right Side Grid */}
          <div className="col-span-2 grid grid-cols-2 gap-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="relative overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Image Carousel */}
        <div className="md:hidden rounded-xl overflow-hidden">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>

      {/* Business Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2">
          <div className="mb-4 md:mb-6 space-y-4">
            <Skeleton className="h-7 w-64" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Amenities */}
            <div className="space-y-3 pb-4 border-b border-[#E4E4E7]">
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-8 w-24" />
                ))}
              </div>
            </div>

            {/* Reviews */}
            <Skeleton className="h-5 w-32" />
          </div>
        </div>

        {/* Right Column - Opening Hours */}
        <div className="lg:col-span-1">
          <Card className="p-4 border border-[#E4E4E7] space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-4 w-full" />

            <div className="space-y-2 pt-4 border-t border-[#E4E4E7]">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StepIndicatorSkeleton() {
  return (
    <div className="flex items-center justify-between">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center flex-1">
          {/* Step Circle */}
          <Skeleton className="h-8 w-8 rounded-full" />

          {/* Step Label */}
          {index < 3 && (
            <>
              <div className="flex-1 mx-2">
                <Skeleton className="h-1 w-full" />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function StepContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Step Title */}
      <Skeleton className="h-7 w-48" />

      {/* Content Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-4 space-y-3">
            {/* Image or Icon placeholder */}
            <Skeleton className="h-32 w-full" />

            {/* Title */}
            <Skeleton className="h-5 w-3/4" />

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Price and Duration */}
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BookingSidebarSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5 sticky top-24 bg-white shadow-xl space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
        </div>

        <hr className="border-[#E4E4E7]" />

        {/* Resume Section */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />

          {/* Services */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>

          <hr className="border-[#E4E4E7]" />

          {/* Total */}
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>

          <Skeleton className="h-3 w-32" />
        </div>
      </Card>
    </div>
  );
}
