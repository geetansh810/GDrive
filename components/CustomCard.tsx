import { Models } from "node-appwrite";
import { convertFileSize, getFileIcon } from "@/lib/utils";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/ActionDropdown";
import CustomThumbnail from "./CustomThumbnail";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const CustomCard = ({ file }: { file: Models.Document }) => {
    return (
        <div className="w-56 rounded-lg bg-white p-3 shadow-md transition-all hover:shadow-lg">
            {/* 🔹 Top Section: File Type Icon, Name & More Button */}
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Image
                        src={getFileIcon(file.extension, file.type)}
                        alt="thumbnail"
                        width={60}
                        height={60}
                        className="size-5 object-cover"
                    />
                    <p className="w-32 truncate text-sm font-medium">{file.name}</p>
                </div>
                <ActionDropdown file={file} />
            </div>

            {/* 🔹 Middle Section: Thumbnail */}
            <div className="flex h-28 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                <CustomThumbnail
                    type={file.type}
                    extension={file.extension}
                    url={file.thumbnail}
                    className="size-full object-cover"
                />
            </div>

            {/* 🔹 Bottom Section: File Size, Date & Owner (One Line) */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <Avatar className="size-5 object-cover">
                        <AvatarImage src={file.owner?.avatar || "/default-avatar.png"} alt="User Avatar" />
                        <AvatarFallback>{file.owner?.fullName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>

                    <FormattedDateTime date={file.$createdAt} />
                </div>
                {/* <p className="truncate">By: {file.owner.fullName}</p> */}
                <p>{convertFileSize(file.size)}</p>
            </div>
        </div>
    );
};

export default CustomCard;