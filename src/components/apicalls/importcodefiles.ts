"use server";

const BASE_URL = process.env.API_URL || "https://dev.sourcebytes.ai/api/v1"; // Fallback for safety

export async function getCodeFiles(
  token: string,
  tenant_id: string
): Promise<any> {
  const url = `${BASE_URL}/${tenant_id}/code_documentation/get-code-files/`;
  let allResults: any[] = [];
  let nextUrl: string | null = url;
  let totalCount: number = 0;

  try {
    while (nextUrl) {
      const response = await fetch(nextUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const text = await response.text();
      console.log("GetCodeFiles Response Status:", response.status);
      console.log("GetCodeFiles Raw Response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        return {
          success: false,
          error: `Invalid JSON response: ${text.substring(0, 100)}...`,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error:
            data.message ||
            `Fetching code files failed with status ${response.status}`,
        };
      }

      // Accumulate results and set total count from the first response
      allResults = allResults.concat(data.data.results);
      if (nextUrl === url) totalCount = data.data.count; // Set count from the first page
      nextUrl = data.data.next;
    }

    return {
      success: true,
      data: { data: { results: allResults, count: totalCount } }, // Include count in the response
    };
  } catch (error) {
    console.error("Error in getCodeFiles:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

interface SyncCodeFileForm {
  codefile_id: string;
  codefile_path: string;
  status: string;
}

export async function syncCodeFile(
  token: string,
  tenant_id: string,
  form: SyncCodeFileForm
): Promise<any> {
  // Existing implementation...
  const url = `${BASE_URL}/${tenant_id}/code_documentation/create/`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(form),
    });

    const text = await response.text();
    // console.log("SyncCodeFile Response Status:", response.status);
    // console.log("SyncCodeFile Raw Response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      return {
        success: false,
        error: `Invalid JSON response: ${text.substring(0, 100)}...`,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          data.message ||
          `Syncing code file failed with status ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in syncCodeFile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function uploadCodeFile(
  token: string,
  tenant_id: string,
  file: File
): Promise<any> {
  const url = `${BASE_URL}/${tenant_id}/code_documentation/upload-code-file/`;
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    const text = await response.text();
    // console.log("UploadCodeFile Response Status:", response.status);
    // console.log("UploadCodeFile Raw Response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      return {
        success: false,
        error: `Invalid JSON response: ${text.substring(0, 100)}...`,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          data.message ||
          `Uploading code file failed with status ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in uploadCodeFile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function downloadCodeFile(
  token: string,
  tenant_id: string,
  id: string
): Promise<any> {
  const url = `${BASE_URL}/${tenant_id}/code_documentation/file/${id}/download-code-documentation/`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        return {
          success: false,
          error: `Invalid response: ${text.substring(0, 100)}...`,
        };
      }
      return {
        success: false,
        error:
          data.message ||
          `Downloading code file failed with status ${response.status}`,
      };
    }

    // Get the blob data for download
    const blob = await response.blob();

    // Extract filename from content-disposition header if available
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `downloaded_file_${id}`;
    if (contentDisposition && contentDisposition.includes("filename=")) {
      filename = contentDisposition
        .split("filename=")[1]
        .replace(/"/g, "")
        .trim();
    }

    return {
      success: true,
      data: {
        blob,
        filename,
      },
    };
  } catch (error) {
    console.error("Error in downloadCodeFile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
