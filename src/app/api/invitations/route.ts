import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Invitation } from "@/models/Invitation";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const name = searchParams.get("name") || "";
    const area = searchParams.get("area") || "";
    const sort = searchParams.get("sort") || "desc"; // asc or desc

    const filter: any = {};
    if (name) filter.name = { $regex: name, $options: "i" };
    if (area) filter.area = area;

    const invitations = await Invitation.find(filter).sort({
      numberOfPeople: sort === "asc" ? 1 : -1,
    });

    const totalInvitations = await Invitation.countDocuments(filter);
    const totalPeople = invitations.reduce(
      (sum, inv) => sum + inv.people,
      0
    );

    return NextResponse.json({
      success: true,
      data: invitations,
      totalInvitations,
      totalPeople,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}


export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();
  const newInvite = await Invitation.create(data);
  return NextResponse.json(newInvite);
}

export async function PUT(req: Request) {
  await connectDB();
  const { _id, ...rest } = await req.json();
  const updated = await Invitation.findByIdAndUpdate(_id, rest, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await Invitation.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
