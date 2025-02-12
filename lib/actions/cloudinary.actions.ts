import sharp from "sharp";
// import { PDFDocument } from "pdf-lib";
// import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
// import * as pdfjsLib from "pdfjs-dist";
import path from "path";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a buffer to Cloudinary and returns its URL.
 */
const uploadToCloudinary = async (buffer: Buffer, fileName: string, resourceType: "image" | "video") => {
    return new Promise<string | null>((resolve, reject) => {
        const fileBaseName = path.parse(fileName).name; // Remove extension

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "thumbnails",
                format: "jpg",
                public_id: fileBaseName,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                } else {
                    resolve(result?.secure_url ?? null);
                }
            }
        );

        uploadStream.end(buffer);
    });
};

/**
 * Generates a thumbnail for images, PDFs, and videos.
 * Uploads the thumbnail to Cloudinary and returns its URL.
 */
export const generateThumbnail = async (fileBuffer: Buffer, fileType: string, fileName: string): Promise<string | null> => {
    try {
        let thumbnailBuffer: Buffer | null = null;

        // Handle Images
        if (fileType.startsWith("image/")) {
            thumbnailBuffer = await sharp(fileBuffer)
                .resize({ width: 300 })
                .jpeg({ quality: 80 })
                .toBuffer();
            return uploadToCloudinary(thumbnailBuffer, fileName, "image");
        }

        // Handle PDFs (Extract the first page)
        // if (fileType === "application/pdf") {
        //     // Load the PDF
        //     const pdfDoc = await PDFDocument.load(fileBuffer);
        //     const page = pdfDoc.getPage(0); // Get the first page

        //     // Convert the first page to an image (Base64)
        //     const { width, height } = page.getSize();
        //     const pngImage = await page.drawImage({
        //         x: 0,
        //         y: 0,
        //         width,
        //         height,
        //         opacity: 1,
        //     });

        //     const imageBuffer = pngImage?.toBuffer(); // Convert to Buffer

        //     if (!imageBuffer) {
        //         console.error("Failed to generate image from PDF");
        //         return null;
        //     }

        //     const pngBuffer = await sharp(imageBuffer).resize(300, 400).png({ quality: 80 }).toBuffer();

        //     // Upload to Cloudinary
        //     return uploadToCloudinary(pngBuffer, fileName.replace(".pdf", ".png"), "image");
        // }

        // Handle Videos (Use Cloudinary's built-in thumbnail generation)
        if (fileType.startsWith("video/")) {
            return new Promise<string | null>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "videos", resource_type: "video", public_id: fileName },
                    (error, result) => {
                        if (error) {
                            console.error("Cloudinary video upload error:", error);
                            reject(error);
                        } else if(result) {
                            // Generate a thumbnail from the video
                            const thumbnailUrl = cloudinary.url(result.public_id, {
                                resource_type: "video",
                                format: "jpg",
                                transformation: [{ width: 300, crop: "limit" }, { start_offset: "1" }],
                            });
                            resolve(thumbnailUrl);
                        }
                    }
                ).end(fileBuffer);
            });
        }

        return null;
    } catch (error) {
        console.error("Error generating thumbnail:", error);
        return null;
    }
};