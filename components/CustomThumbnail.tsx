import React from "react";
import Image from "next/image";
import { cn, getFileIcon } from "@/lib/utils";

interface Props {
    type: string;
    url?: string;
    imageClassName?: string;
    className?: string;
    extension: string;
}

export const CustomThumbnail = ({
    type,
    url = "",
    imageClassName,
    className,
    extension
}: Props) => {
    const isImage = type === "image";
    const isVideo = type === "video";
    const showPreview = isImage || isVideo;

    return (
        <figure className={cn("relative w-full h-full flex items-center justify-center", className)}>
            {showPreview && url ? (
                <Image
                    src={url}
                    alt="thumbnail"
                    width={150}
                    height={150}
                    className={cn("w-full h-full object-cover rounded-md", imageClassName)}
                />
            ) : (
                <Image
                    src={getFileIcon(extension, type)}
                    alt="thumbnail"
                    width={60}
                    height={60}
                    className={cn("object-cover rounded-md", imageClassName)}
                />
            )}
        </figure>
    );
};

export default CustomThumbnail;