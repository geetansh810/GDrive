import { NextResponse } from "next/server";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { Query } from "appwrite";

export async function POST(req: Request) {
    try {
        console.log("Heloooooooo");
        const { email } = await req.json();
        const { storage, databases } = await createAdminClient();

        // Find user in Appwrite database
        const userResponse = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            [Query.equal("email", email)]
        );

        if (userResponse.documents.length === 0) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const user = userResponse.documents[0];

        return NextResponse.json({
            success: true,
            isVerified: user.isVerified, // Assuming this field exists in the collection
            isConnectedToTelegram: Boolean(user.telegramChatId), // True if chat ID exists
        });
    } catch (error) {
        console.error("Error checking user status:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}