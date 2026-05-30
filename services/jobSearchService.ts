import { GoogleJob, GoogleJobsResponse } from "./googleJobsService";
import { db } from "./firebase";
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { JobSearchFilters } from "../types";

// JSearch API returns data that is already very close to the GoogleJob format
interface JSearchResponse {
  status: string;
  request_id: string;
  data: GoogleJob[];
}

export const JobSearchService = {
  searchJobs: async (searchQuery: string, location: string, page: number = 1, filters?: JobSearchFilters): Promise<GoogleJobsResponse> => {
    try {
      const normalizedQuery = (searchQuery || "").toLowerCase().trim();
      const normalizedLocation = (location || "").toLowerCase().trim();
      const filterHash = filters ? JSON.stringify(filters).replace(/[^a-z0-9]/g, '') : 'none';
      const searchId = `${normalizedQuery}_${normalizedLocation}_${page}_${filterHash}`.replace(/[^a-z0-9_]/g, '_');

      // 1. Check Firebase Cache
      if (db) {
        try {
          const searchesRef = collection(db, "job_searches");
          const q = query(
            searchesRef,
            where("query", "==", normalizedQuery),
            where("location", "==", normalizedLocation),
            where("page", "==", page)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const cachedDoc = querySnapshot.docs[0].data();
            const cachedTime = cachedDoc.timestamp.toDate();
            const now = new Date();
            const hoursDiff = (now.getTime() - cachedTime.getTime()) / (1000 * 60 * 60);

            // Use cache if it's less than 5 days (120 hours) old
            if (hoursDiff < 120) {
              console.log("Returning cached job search results from Firebase");
              return {
                data: JSON.parse(cachedDoc.results),
                status: "OK",
                request_id: `cached-${Date.now()}`,
                total_count: cachedDoc.total_count,
              };
            }
          }
        } catch (cacheError) {
          console.error("Error reading from Firebase cache:", cacheError);
          // Continue to fetch from API if cache read fails
        }
      }

      // 2. Fetch from API
      const response = await fetch("/api/jobs/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          location,
          page,
          filters
        }),
      });

      if (!response.ok) {
        throw new Error(`Job search request failed with status ${response.status}`);
      }

      const data: JSearchResponse = await response.json();
      
      // Ensure all jobs have a source label
      const formattedData = (data.data || []).map(job => ({
        ...job,
        source: job.job_publisher || "JSearch"
      }));

      const result: GoogleJobsResponse = {
        data: formattedData,
        status: data.status || "OK",
        request_id: data.request_id || `jsearch-${Date.now()}`,
        total_count: formattedData.length, // JSearch doesn't always return total count
      };

      // 3. Save to Firebase Cache
      if (db && formattedData.length > 0) {
        try {
          await setDoc(doc(db, "job_searches", searchId), {
            query: normalizedQuery,
            location: normalizedLocation,
            page: page,
            results: JSON.stringify(formattedData),
            timestamp: serverTimestamp(),
            total_count: result.total_count
          });
          console.log("Saved job search results to Firebase cache");
        } catch (cacheWriteError) {
          console.error("Error writing to Firebase cache:", cacheWriteError);
        }
      }

      return result;
    } catch (error) {
      console.error("Error fetching from JSearch proxy:", error);
      return {
        data: [],
        status: "ERROR",
        request_id: `error-${Date.now()}`,
        total_count: 0,
      };
    }
  }
};
