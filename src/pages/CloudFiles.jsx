import { useEffect, useRef, useState } from "react";

import {
  getStoredFiles,
  saveFile,
  deleteStoredFile,
  downloadStoredFile,
} from "../services/storageService";

import {
  createFileMetadata,
  getUserFileMetadata,
  deleteFileMetadata,
} from "../services/fileMetadataService";

import {
  createFileMetadataWithApi,
  getFilesWithApi,
  deleteFileMetadataWithApi,
} from "../services/fileApiService";

function CloudFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [storageSource, setStorageSource] = useState("FastAPI");

  const fileInputRef = useRef(null);

  /**
   * Convert local file object into a consistent format.
   *
   * Different local-storage implementations may use slightly
   * different property names, so this helper keeps the UI stable.
   */
  function normalizeLocalFile(file) {
    return {
      ...file,
      id: file?.id || file?.localFileId || "",
      filename:
        file?.filename ||
        file?.name ||
        "Unnamed file",
      size: Number(file?.size || 0),
      contentType:
        file?.contentType ||
        file?.type ||
        "application/octet-stream",
    };
  }

  /**
   * Build metadata payload expected by FastAPI / Firestore.
   */
  function buildMetadataPayload(localFile) {
    const normalizedFile = normalizeLocalFile(localFile);

    return {
      localFileId: normalizedFile.id,
      filename: normalizedFile.filename,
      storagePath: `local-simulation/${normalizedFile.id}/${normalizedFile.filename}`,
      size: normalizedFile.size,
      contentType: normalizedFile.contentType,
      storageMode: "local-simulation",
    };
  }

  /**
   * Clear temporary messages.
   */
  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  /**
   * Load files from local storage and cloud metadata.
   *
   * Priority:
   * 1. FastAPI
   * 2. Firestore fallback
   */
  const loadFiles = async () => {
    try {
      setLoading(true);
      setError("");

      const storedFiles = getStoredFiles() || [];
      const localFiles = storedFiles.map(normalizeLocalFile);

      let cloudMetadata = [];
      let metadataSource = "FastAPI";

      try {
        const apiResult = await getFilesWithApi();

        cloudMetadata = Array.isArray(apiResult?.files)
          ? apiResult.files
          : [];

        metadataSource = "FastAPI + Firebase Firestore";
      } catch (apiError) {
        console.warn(
          "FastAPI file metadata unavailable. Using Firestore fallback.",
          apiError
        );

        try {
          const firestoreResult = await getUserFileMetadata();

          cloudMetadata = Array.isArray(firestoreResult)
            ? firestoreResult
            : firestoreResult?.files || [];

          metadataSource = "Firestore fallback";
        } catch (firestoreError) {
          console.warn(
            "Firestore metadata fallback also failed.",
            firestoreError
          );

          cloudMetadata = [];
          metadataSource = "Local Storage Simulation";
        }
      }

      /**
       * Match cloud metadata with local file content.
       */
      const metadataMap = new Map(
        cloudMetadata
          .filter((metadata) => metadata?.localFileId)
          .map((metadata) => [
            metadata.localFileId,
            metadata,
          ])
      );

      /**
       * Existing local files might not have metadata yet.
       * Synchronize those files with FastAPI first.
       */
      const unsyncedFiles = localFiles.filter(
        (localFile) =>
          localFile.id &&
          !metadataMap.has(localFile.id)
      );

      if (unsyncedFiles.length > 0) {
        for (const localFile of unsyncedFiles) {
          const metadataPayload =
            buildMetadataPayload(localFile);

          try {
            const createdMetadata =
              await createFileMetadataWithApi(
                metadataPayload
              );

            if (createdMetadata?.id) {
              metadataMap.set(
                localFile.id,
                createdMetadata
              );
            }
          } catch (apiError) {
            console.warn(
              `FastAPI metadata sync failed for ${localFile.filename}.`,
              apiError
            );

            /**
             * Firestore fallback for metadata creation.
             */
            try {
              const firestoreMetadata =
                await createFileMetadata(
                  metadataPayload
                );

              if (firestoreMetadata?.id) {
                metadataMap.set(
                  localFile.id,
                  firestoreMetadata
                );
              }
            } catch (firestoreError) {
              console.warn(
                `Firestore metadata sync failed for ${localFile.filename}.`,
                firestoreError
              );
            }
          }
        }

        /**
         * Synchronization completed, so keep source description
         * accurate.
         */
        if (metadataSource === "FastAPI + Firebase Firestore") {
          metadataSource =
            "FastAPI + Firebase Firestore";
        }
      }

      /**
       * Combine local content information with cloud metadata.
       */
      const mergedFiles = localFiles.map((localFile) => {
        const metadata = metadataMap.get(localFile.id);

        return {
          ...localFile,
          cloudMetadataId: metadata?.id || null,
          cloudMetadata: metadata || null,
        };
      });

      setFiles(mergedFiles);
      setStorageSource(metadataSource);
    } catch (err) {
      console.error(
        "Unable to load cloud files:",
        err
      );

      setError(
        err?.message ||
          "Unable to load files."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  /**
   * Open hidden file selector.
   */
  const handleChooseFile = () => {
    if (uploading) {
      return;
    }

    fileInputRef.current?.click();
  };

  /**
   * Upload selected file.
   */
  const handleUpload = async (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccessMessage("");

      /**
       * Step 1:
       * Save actual file content using local storage simulation.
       */
      const storedFile =
        await saveFile(selectedFile);

      const normalizedStoredFile =
        normalizeLocalFile(storedFile);

      /**
       * Make sure local ID is available.
       */
      if (!normalizedStoredFile.id) {
        throw new Error(
          "The local file could not be assigned an ID."
        );
      }

      /**
       * Step 2:
       * Prepare metadata for FastAPI.
       */
      const metadataPayload =
        buildMetadataPayload(
          normalizedStoredFile
        );

      let cloudMetadata = null;
      let metadataSourceForFile =
        "FastAPI + Firebase Firestore";

      /**
       * Step 3:
       * FastAPI is the primary metadata API.
       */
      try {
        cloudMetadata =
          await createFileMetadataWithApi(
            metadataPayload
          );
      } catch (apiError) {
        console.warn(
          "FastAPI metadata upload failed. Trying Firestore fallback.",
          apiError
        );

        metadataSourceForFile =
          "Firestore fallback";

        /**
         * Step 4:
         * Direct Firestore fallback.
         */
        cloudMetadata =
          await createFileMetadata(
            metadataPayload
          );
      }

      /**
       * Step 5:
       * Add the complete file information to UI.
       */
      const fileForUi = {
        ...normalizedStoredFile,
        cloudMetadataId:
          cloudMetadata?.id || null,
        cloudMetadata:
          cloudMetadata || null,
      };

      setFiles((currentFiles) => [
        fileForUi,
        ...currentFiles.filter(
          (existingFile) =>
            existingFile.id !==
            normalizedStoredFile.id
        ),
      ]);

      setStorageSource(
        metadataSourceForFile
      );

      setSuccessMessage(
        "File uploaded and metadata saved successfully."
      );
    } catch (err) {
      console.error(
        "File upload failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to upload the selected file."
      );
    } finally {
      setUploading(false);

      /**
       * Reset input so the same file can be
       * selected again later.
       */
      event.target.value = "";
    }
  };

  /**
   * Download local file content.
   */
  const handleDownload = async (file) => {
    try {
      setError("");

      await downloadStoredFile(file.id);

      setSuccessMessage(
        `${file.filename} downloaded successfully.`
      );
    } catch (err) {
      console.error(
        "File download failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to download the file."
      );
    }
  };

  /**
   * Delete file:
   *
   * 1. Delete cloud metadata using FastAPI.
   * 2. Firestore fallback when required.
   * 3. Delete local file content.
   */
  const handleDelete = async (file) => {
    const confirmed = window.confirm(
      `Delete "${file.filename}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      /**
       * Delete cloud metadata first.
       */
      if (file.cloudMetadataId) {
        try {
          await deleteFileMetadataWithApi(
            file.cloudMetadataId
          );
        } catch (apiError) {
          console.warn(
            "FastAPI metadata deletion failed. Trying Firestore fallback.",
            apiError
          );

          await deleteFileMetadata(
            file.cloudMetadataId
          );
        }
      }

      /**
       * Delete actual local content.
       */
      await deleteStoredFile(file.id);

      /**
       * Remove from UI.
       */
      setFiles((currentFiles) =>
        currentFiles.filter(
          (item) => item.id !== file.id
        )
      );

      setSuccessMessage(
        `${file.filename} deleted successfully.`
      );
    } catch (err) {
      console.error(
        "File deletion failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete the file."
      );
    }
  };

  /**
   * Format file size.
   */
  const formatFileSize = (bytes) => {
    const size = Number(bytes || 0);

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  };

  /**
   * Format date for UI.
   */
  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString();
  };

  /**
   * Get a readable file type.
   */
  const getFileType = (file) => {
    const contentType =
      file?.contentType || "";

    if (contentType.startsWith("image/")) {
      return "Image";
    }

    if (contentType === "application/pdf") {
      return "PDF";
    }

    if (contentType.startsWith("text/")) {
      return "Text";
    }

    return "File";
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Cloud Storage
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              Cloud Files
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Upload and manage your meal-plan related
              files using the project's cloud metadata
              layer and local storage simulation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleChooseFile}
            disabled={uploading}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading
              ? "Uploading..."
              : "Upload File"}
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.txt"
          onChange={handleUpload}
        />
      </div>

      {/* Storage Architecture Card */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Storage Architecture
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Actual file content is stored locally for the
              demonstration, while file metadata is handled
              through the authenticated API and Firebase
              Firestore.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              File Content: Local Simulation
            </span>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Metadata: {storageSource}
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="text-sm font-medium text-slate-600">
            Loading your files...
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Files
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {files.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Storage Mode
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                Local Simulation
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Metadata Source
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {storageSource}
              </p>
            </div>
          </div>

          {/* Empty State */}
          {files.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <svg
                  className="h-7 w-7 text-slate-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0L8 8m4-4 4 4M5 20h14"
                  />
                </svg>
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                No files uploaded yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Upload a JPG, PNG, WEBP, PDF, or TXT file
                to demonstrate the cloud file metadata
                workflow.
              </p>

              <button
                type="button"
                onClick={handleChooseFile}
                disabled={uploading}
                className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                Upload Your First File
              </button>
            </div>
          ) : (
            /* File List */
            <div className="space-y-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    {/* File Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                          <svg
                            className="h-6 w-6 text-emerald-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14 2v6h6"
                            />
                          </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-semibold text-slate-900">
                            {file.filename}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {getFileType(file)}
                            </span>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {formatFileSize(
                                file.size
                              )}
                            </span>

                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                              Local Simulation
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Uploaded
                          </p>

                          <p className="mt-1 break-words text-slate-700">
                            {formatDate(
                              file.cloudMetadata
                                ?.uploadedAt
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Storage Path
                          </p>

                          <p className="mt-1 break-all text-slate-700">
                            {file.cloudMetadata
                              ?.storagePath ||
                              `local-simulation/${file.id}/${file.filename}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(file)
                        }
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Download
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(file)
                        }
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CloudFiles;