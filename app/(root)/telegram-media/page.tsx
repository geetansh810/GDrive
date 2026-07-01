import React from "react";
import TelegramMedia from "@/components/TelegramMedia";
import { getTelegramFiles } from "@/lib/actions/file.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const Page = async ({ searchParams }: SearchParamProps) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) return redirect("/sign-in");
  if (!currentUser.telegramVerified) return redirect("/connect-telegram");

  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";

  const files = await getTelegramFiles({ searchText, sort });

  return (
    <TelegramMedia
      files={files || { documents: [], total: 0 }}
      telegramUsername={currentUser.telegramUsername}
    />
  );
};

export default Page;
