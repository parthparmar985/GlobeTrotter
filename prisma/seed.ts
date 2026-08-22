// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const cities = [
  { name: "Paris", country: "France", costIndex: 8, popularity: 98 },
  { name: "Bangkok", country: "Thailand", costIndex: 3, popularity: 92 },
  { name: "Tokyo", country: "Japan", costIndex: 7, popularity: 95 },
  { name: "Lisbon", country: "Portugal", costIndex: 5, popularity: 85 },
  { name: "Bali", country: "Indonesia", costIndex: 3, popularity: 90 },
  { name: "New York", country: "USA", costIndex: 9, popularity: 96 },
  { name: "Barcelona", country: "Spain", costIndex: 6, popularity: 88 },
  { name: "Cape Town", country: "South Africa", costIndex: 4, popularity: 78 },
  { name: "Kyoto", country: "Japan", costIndex: 6, popularity: 84 },
  { name: "Mexico City", country: "Mexico", costIndex: 4, popularity: 80 },
];



const activityTemplates = [
  { name: "Airport transfer", category: "Transport", cost: 25, durationHrs: 1 },
  { name: "Hotel stay (per night)", category: "Stay", cost: 80, durationHrs: 24 },
  { name: "City walking tour", category: "Activities", cost: 15, durationHrs: 3 },
  { name: "Local food tasting tour", category: "Meals", cost: 40, durationHrs: 2.5 },
  { name: "Museum entry", category: "Activities", cost: 20, durationHrs: 2 },
  { name: "Sunset boat cruise", category: "Activities", cost: 55, durationHrs: 2 },
  { name: "Cooking class", category: "Meals", cost: 60, durationHrs: 3 },
  { name: "Hiking day trip", category: "Activities", cost: 35, durationHrs: 6 },
];

async function main() {
  console.log("Seeding cities and activities...");

  for (const cityData of cities) {
    const city = await prisma.city.create({ data: cityData });

    await prisma.activity.createMany({
      data: activityTemplates.map((a) => ({
        ...a,
        cost: a.cost * (cityData.costIndex / 5), // scale cost by city cost index
        cityId: city.id,
        description: `${a.name} in ${city.name}`,
      })),
    });
  }

  console.log(`Seeded ${cities.length} cities with activities each.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });