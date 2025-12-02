import { supabase } from "@/src/services/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

export async function uploadPdfToSupabase(localUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: "base64",
  });

  const fileData = decode(base64);
  const fileName = `bill_${Date.now()}.pdf`;

  const { error } = await supabase.storage
    .from("bills")
    .upload(fileName, fileData, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("bills").getPublicUrl(fileName);

  return data.publicUrl;
}
