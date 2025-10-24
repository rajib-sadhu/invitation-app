import { connectDB } from "@/lib/mongodb";
import { Area } from "@/models/Area";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const areas = ["Basirhat", "Kolkata", "Barasat", "Bongaon", "Habra"];
  await Area.insertMany(areas.map((name) => ({ name })));
  return NextResponse.json({ message: "Seeded areas" });
}
