import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user.model";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        await connectToDatabase();

        // Find user in MongoDB
        const user = await User.findOne({ email }).lean();

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            isVerified: user.telegramVerified,
            isConnectedToTelegram: Boolean(user.telegramChatId),
        });
    } catch {
//         console.error("Error checking user status:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}