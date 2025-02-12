// export const getFilePreviewData = async (file) => {
//         const fileResponse = await axios.get(
//             `https://api.telegram.org/bot${botToken}/getFile?file_id=${file.file_id}`
//         );

//         if (fileResponse.data.ok) {
//             const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileResponse.data.result.file_path}`;

//             // Step 4: Fetch file data as a blob
//             const blobResponse = await axios.get(fileUrl, { responseType: "arraybuffer" });
//             const base64 = Buffer.from(blobResponse.data, "binary").toString("base64");

//             file.previewUrl = `data:${file.mime_type};base64,${base64}`;
//         }

//         return file;
// };