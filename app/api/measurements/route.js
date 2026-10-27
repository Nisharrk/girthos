import connectDB from "@/lib/db";
import Measurement from "@/models/Measurement";
import { validateMeasurement } from "@/lib/measurements.mjs";
import { NextResponse } from "next/server";

function failure(error, message) {
  // Do not log connection strings or request contents.
  console.error(message, error.name);
  const status = error instanceof SyntaxError || error.name === "ValidationError" || error.name === "CastError" ? 400 : 500;
  return NextResponse.json({ error: status === 400 ? "Invalid measurement data" : message }, { status });
}
const validId = (id) => typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

export async function GET() {
  try {
    await connectDB();
    const data = await Measurement.find().sort({ date: 1, _id: 1 }).lean();
    return NextResponse.json(data);
  } catch (error) {
    return failure(error, "Unable to load measurements. Please try again.");
  }
}

async function save(request, editing) {
  try {
    const body = await request.json();
    if (editing && !validId(body?.id)) {
      return NextResponse.json({ error: "A valid measurement ID is required" }, { status: 400 });
    }
    const { value, errors } = validateMeasurement(body);
    if (Object.keys(errors).length) {
      return NextResponse.json({ error: Object.entries(errors).map(([field, message]) => `${field}: ${message}`).join("; "), errors }, { status: 400 });
    }
    await connectDB();
    const data = editing
      ? await Measurement.findByIdAndUpdate(body.id, value, { new: true, runValidators: true })
      : await Measurement.create(value);
    if (!data) return NextResponse.json({ error: "Measurement not found" }, { status: 404 });
    return NextResponse.json(data, { status: editing ? 200 : 201 });
  } catch (error) {
    return failure(error, "Unable to save measurement. Please try again.");
  }
}
export const POST = (request) => save(request, false);
export const PUT = (request) => save(request, true);

export async function DELETE(request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!validId(id)) return NextResponse.json({ error: "A valid measurement ID is required" }, { status: 400 });
    await connectDB();
    const data = await Measurement.findByIdAndDelete(id);
    if (!data) return NextResponse.json({ error: "Measurement not found" }, { status: 404 });
    return NextResponse.json({ message: "Measurement deleted successfully" });
  } catch (error) {
    return failure(error, "Unable to delete measurement. Please try again.");
  }
}
