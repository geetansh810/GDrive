"use client";

import React, { useState } from "react";
import DocumentViewer from "@/components/DocumentViewer";
import Sort from "./Sort";
import CustomCard from "./CustomCard";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Props {
  files: {
    documents: Models.Document[];
    total: number;
  };
  telegramUsername: string;
}

const TelegramMedia = ({ files, telegramUsername }: Props) => {
  const [selectedFile, setSelectedFile] = useState<Models.Document | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      router.refresh();
      toast({
        title: "Refreshed",
        description: "Successfully fetched latest media from Telegram chat.",
      });
    } catch {
//       console.error("Refresh error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during refresh.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="page-container">
      <section className="w-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="h1 capitalize">Telegram Media</h1>
          <p className="text-light-200 mt-1 text-sm">
            Connected Bot: <strong className="text-brand">@{telegramUsername}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-brand text-white hover:bg-brand-100"
          >
            <RefreshCcw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>
            <Sort />
          </div>
        </div>
      </section>

      {/* Render the files */}
      {files.total > 0 ? (
        <section className="file-list mt-6">
          {files.documents.map((file: Models.Document) => (
            <div
              key={file.$id}
              onClick={() => setSelectedFile(file)}
              className="cursor-pointer"
            >
              <CustomCard file={file} />
            </div>
          ))}
        </section>
      ) : (
        <p className="empty-list mt-10">No Telegram files found. Send some media to the bot and click Refresh!</p>
      )}

      {selectedFile && (
        <DocumentViewer
          url={selectedFile.telegramFileURL}
          type={selectedFile.type}
          name={selectedFile.name}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
};

export default TelegramMedia;
