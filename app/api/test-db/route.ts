import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";

export async function GET() {
    try {
        await connectToDB();
        return NextResponse.json({ message: "MongoDB connected successfully!" });
    } catch (error) {
        return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }
}