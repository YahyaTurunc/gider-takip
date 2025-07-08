import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { ResponseType } from "@/types";
import axios from "axios";
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

export const uploadFileToCloudinary = async (
   file: { uri?: string } | string,
   folderName: string,
): Promise<ResponseType> => {
   try {

      if (typeof file === "string") {
         return { success: true, data: file }
      }
      if (file && file.uri) {
         const formData = new FormData();
         formData.append("file", {
            uri: file.uri,
            type: "image/jpeg", // Adjust the type based on your file type
            name: file?.uri?.split('/').pop() || "image.jpg", // Extract the file name
         } as any);
         formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
         formData.append("folder", folderName);
         const response = await axios.post(CLOUDINARY_API_URL, formData, {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         });
         // console.log("Cloudinary response:", response.data);
         return {
            success: true,
            data: response?.data?.secure_url
         }
      }
      return { success: true }
   } catch (error: any) {
      console.log("Error uploading file to Cloudinary:", error);
      return {
         success: false,
         msg: error.message || "Failed to upload file",
      }

   }
}
export const getProfileImage = (file: any) => {
   if (file && typeof file === "string") return file;
   if (file && typeof file === "object") return file.uri;

   return require('@/assets/images/defaultAvatar.png');
};
export const getFilePath = (file: any) => {
   if (file && typeof file === "string") return file;
   if (file && typeof file === "object") return file.uri;

   return null;
};