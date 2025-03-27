import connectDB from "@/lib/db";
import Measurement from "@/models/Measurement";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  try {
    const data = await Measurement.find().sort({ date: 1 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.date || !body.weight) {
      return NextResponse.json(
        { error: "Date and weight are required" },
        { status: 400 }
      );
    }

    const newEntry = new Measurement({
      date: new Date(body.date),
      height: body.height,
      weight: body.weight,
      chest: body.chest,
      leftBicep: body.leftBicep,
      rightBicep: body.rightBicep,
      waist: body.waist,
      leftThigh: body.leftThigh,
      rightThigh: body.rightThigh,
      leftCalf: body.leftCalf,
      rightCalf: body.rightCalf,
    });

    await newEntry.save();
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Measurement ID is required" },
        { status: 400 }
      );
    }

    const deletedMeasurement = await Measurement.findByIdAndDelete(id);
    if (!deletedMeasurement) {
      return NextResponse.json(
        { error: "Measurement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Measurement deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting measurement" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  await connectDB();
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Measurement ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!updateData.date || !updateData.weight) {
      return NextResponse.json(
        { error: "Date and weight are required" },
        { status: 400 }
      );
    }

    const updatedMeasurement = await Measurement.findByIdAndUpdate(
      id,
      {
        date: new Date(updateData.date),
        height: updateData.height ? Number(updateData.height) : null,
        weight: updateData.weight,
        chest: updateData.chest,
        leftBicep: updateData.leftBicep,
        rightBicep: updateData.rightBicep,
        waist: updateData.waist,
        leftThigh: updateData.leftThigh,
        rightThigh: updateData.rightThigh,
        leftCalf: updateData.leftCalf,
        rightCalf: updateData.rightCalf,
      },
      { new: true }
    );

    if (!updatedMeasurement) {
      return NextResponse.json(
        { error: "Measurement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMeasurement);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating measurement" },
      { status: 500 }
    );
  }
}
