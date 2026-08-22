// src/app/(dashboard)/cities/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchCities } from "@/lib/actions/discovery";
import { AddToTripDialog } from "@/components/discovery-widgets";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default async function CitySearchPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; country?: string }>;
}) {
  const { search, country } = await searchParams;
  const session = await getServerSession(authOptions);

  const [cities, trips] = await Promise.all([
    searchCities(search, country),
    prisma.trip.findMany({
      where: { userId: session!.user.id },
      select: { id: true, name: true },
      orderBy: { startDate: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Explore Cities</h1>
        <p className="text-slate-600">Search and add destinations to your trips.</p>
      </div>

      <form method="GET" className="flex gap-3">
        <Input
          name="search"
          placeholder="Search by city name..."
          defaultValue={search}
          className="max-w-sm"
        />
        <Input
          name="country"
          placeholder="Filter by country..."
          defaultValue={country}
          className="max-w-xs"
        />
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
          Search
        </button>
      </form>

      {trips.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-sm text-slate-500">
          You don't have any trips yet — create one first, then come back here to add cities.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <div key={city.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{city.name}</p>
                <p className="text-sm text-slate-500">{city.country}</p>
              </div>
              <Badge variant="secondary">Cost {city.costIndex}/10</Badge>
            </div>
            <p className="mt-2 text-xs text-slate-400">Popularity: {city.popularity}/100</p>
            <div className="mt-4">
              <AddToTripDialog city={city} trips={trips} />
            </div>
          </div>
        ))}
      </div>

      {cities.length === 0 && (
        <p className="text-center text-slate-500">No cities match your search.</p>
      )}
    </div>
  );
}