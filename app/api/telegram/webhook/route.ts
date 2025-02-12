import { NextResponse } from "next/server";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { Query, ID } from "appwrite";

// curl - F "url=" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
// http://localhost:3000/api/webhook/telegram

export async function POST(req: Request) {
    try {
        const { storage, databases } = await createAdminClient();
        
        const body = await req.json();

        // Extract user details from Telegram
        const { message } = body;
        if (!message) {
            return NextResponse.json({ success: false, message: "No message data" }, { status: 400 });
        }

        const { chat, from, text } = message;
        const telegramChatId = chat.id.toString();
        const telegramUserId = from.id.toString();
        const username = from.username || "";

        console.log("Received Telegram message:", { telegramChatId, telegramUserId, text });

        // If this is a `/start` message, proceed to link the user
        if (text && text.startsWith("/start")) {
            const args = text.split(" ");
            const userId = args.length > 1 ? args[1] : null;

            if (!userId) {
                return NextResponse.json({ success: false, message: "Missing user ID in /start command" }, { status: 400 });
            }

            // Find user in Appwrite using the provided user ID
            const userResponse = await databases.listDocuments(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
                [Query.equal("$id", userId)]
            );

            if (userResponse.documents.length === 0) {
                return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
            }

            const user = userResponse.documents[0];

            // Update the user with Telegram details
            await databases.updateDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
                user.$id,
                {
                    telegramChatId,
                    telegramUserId,
                    telegramUsername: username,
                }
            );

            return NextResponse.json({ success: true, message: "Telegram linked successfully" });
        }

        return NextResponse.json({ success: true, message: "Received non-start message" });
    } catch (error) {
        console.error("Error handling Telegram webhook:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}