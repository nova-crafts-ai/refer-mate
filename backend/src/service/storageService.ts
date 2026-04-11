import { supabase } from "../apis/supabaseClient.js";
import axios from "axios";
import { Readable } from "stream";

export class StorageService {

    async getFileStream(path: string): Promise<Readable> {
        // Get a signed URL (valid for 60 seconds)
        const { data, error } = await supabase.storage
            .from("resumes")
            .createSignedUrl(path, 60);

        if (error || !data?.signedUrl) {
            throw new Error(`Failed to generate signed URL for path: ${path}. Error: ${error?.message}`);
        }

        // Fetch the file as a stream using the signed URL
        const response = await axios.get(data.signedUrl, {
            responseType: "stream",
        });

        return response.data;
    }

    async uploadFileStream(path: string, fileStream: Readable | NodeJS.ReadableStream, mimeType: string): Promise<string> {
        const { data, error } = await supabase.storage
            .from("resumes")
            .upload(path, fileStream, {
                contentType: mimeType,
                upsert: true,
                duplex: "half",
            });

        if (error) {
            throw error;
        }

        return data.path;
    }
}

export const storageService = new StorageService();
