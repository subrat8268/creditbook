import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "../services/supabase";

export const uploadImage = async (uri: string): Promise<string> => {
  try {
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist at the given URI");
    }

    // ✅ Use the new File API
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });

    // Convert base64 to binary
    const fileExt = uri.split(".").pop() || "jpg";
    const fileName = `product_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;
    const fileData = decode(base64Data);

    // ✅ Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("product-images") // bucket name
      .upload(filePath, fileData, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (error) throw error;

    // ✅ Get the public URL
    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);
    if (!data?.publicUrl) throw new Error("Failed to get public URL");

    return data.publicUrl;
  } catch (err: any) {
    console.error("Upload failed:", err.message);
    throw err;
  }
};
