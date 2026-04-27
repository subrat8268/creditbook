import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "../services/supabase";

const getFileExtension = (uri: string) => {
  const cleanUri = uri.split("?")[0]?.split("#")[0] ?? uri;
  const ext = cleanUri.split(".").pop() || "jpg";
  return ext.toLowerCase();
};

const getImageContentType = (ext: string) => {
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    default:
      return "image/jpeg";
  }
};

const uploadToBucket = async (
  uri: string,
  bucket: string,
  filePath: string,
  upsert: boolean,
): Promise<string> => {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    throw new Error("File does not exist at the given URI");
  }

  const base64Data = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });

  const fileExt = getFileExtension(uri);
  const fileData = decode(base64Data);

  const { error } = await supabase.storage.from(bucket).upload(filePath, fileData, {
    contentType: getImageContentType(fileExt),
    upsert,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("Failed to get public URL");

  return data.publicUrl;
};

// Generic image upload (avatars bucket). Product catalog is out of scope.
export const uploadImage = async (uri: string): Promise<string> => {
  const fileExt = getFileExtension(uri);
  const fileName = `image_${Date.now()}.${fileExt}`;
  const filePath = `images/${fileName}`;
  return uploadToBucket(uri, "avatars", filePath, false);
};

export const uploadBusinessLogo = async (
  uri: string,
  vendorId: string,
): Promise<string> => {
  const fileExt = getFileExtension(uri);
  const filePath = `logos/${vendorId}/logo.${fileExt}`;
  return uploadToBucket(uri, "business-logos", filePath, true);
};
