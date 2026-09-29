import { useEffect, useRef, useState } from "react";
import {
  Cloud,
  Download,
  FileImage,
  FileText,
  Trash2,
  Upload,
  CircleAlert,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  deleteLocalFile,
  formatFileSize,
  getLocalFiles,
  uploadLocalFile,
} from "../services/storageService";

import {
  createFileMetadata,
  getUserFileMetadata,
  deleteFileMetadata,
} from "../services/fileMetadataService";

function CloudFiles() {
  const { currentUser } = useAuth();

  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /*
   * Load local files and their Firestore metadata.
   *
   * Existing local files that were uploaded before this
   * metadata feature are automatically synced to Firestore
   * once.
   */
  useEffect(() => {
    let isMounted = true;

    const loadFiles = async () => {
      if (!currentUser) {
        return;
      }

      setLoading(true);
      setMessage("");
      setError("");

      try {
        /*
         * Step 1:
         * Get the actual file content from local storage simulation.
         */
        const savedFiles = getLocalFiles(
          currentUser.uid
        );

        if (isMounted) {
          setFiles(savedFiles);
        }

        /*
         * Step 2:
         * Get cloud metadata from Firestore.
         */
        let metadataFiles = [];

        try {
          metadataFiles =
            await getUserFileMetadata(
              currentUser.uid
            );
        } catch (metadataError) {
          console.error(
            "Failed to load Firestore file metadata:",
            metadataError
          );

          if (isMounted) {
            setError(
              "File content loaded, but Firestore metadata could not be loaded."
            );
          }

          return;
        }

        /*
         * Step 3:
         * Automatically create metadata for older local files
         * that do not have a Firestore record yet.
         */
        const metadataMap = new Map(
          metadataFiles.map((item) => [
            item.localFileId,
            item,
          ])
        );

        const syncedFiles = [];

        for (const file of savedFiles) {
          const existingMetadata =
            metadataMap.get(file.id);

          if (existingMetadata) {
            syncedFiles.push({
              ...file,
              metadataId:
                existingMetadata.id,
              storagePath:
                existingMetadata.storagePath,
              metadataSynced: true,
            });

            continue;
          }

          try {
            const newMetadata =
              await createFileMetadata(
                currentUser.uid,
                file
              );

            syncedFiles.push({
              ...file,
              metadataId: newMetadata.id,
              storagePath:
                newMetadata.storagePath,
              metadataSynced: true,
            });
          } catch (syncError) {
            console.error(
              "Failed to sync file metadata:",
              syncError
            );

            /*
             * Keep the file visible even if metadata
             * synchronization fails.
             */
            syncedFiles.push({
              ...file,
              metadataId: null,
              storagePath: `local-simulation/${currentUser.uid}/${file.id}`,
              metadataSynced: false,
            });
          }
        }

        if (isMounted) {
          setFiles(syncedFiles);
        }
      } catch (err) {
        console.error(
          "Failed to load files:",
          err
        );

        if (isMounted) {
          setError(
            "Unable to load your uploaded files."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFiles();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const selectedFile =
      event.target.files?.[0];

    /*
     * Allow the same file to be selected again.
     */
    event.target.value = "";

    if (!selectedFile || !currentUser) {
      return;
    }

    setMessage("");
    setError("");

    /*
     * Demo safety limit for browser localStorage.
     */
    const maxSize =
      2 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError(
        "For the local demo, please choose a file smaller than 2 MB."
      );
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "text/plain",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setError(
        "Allowed files: JPG, PNG, WEBP, PDF, and TXT."
      );
      return;
    }

    let uploadedFile = null;

    try {
      setUploading(true);

      /*
       * Step 1:
       * Store actual file content in local
       * browser storage simulation.
       */
      uploadedFile =
        await uploadLocalFile(
          currentUser.uid,
          selectedFile
        );

      /*
       * Step 2:
       * Store metadata in Firestore.
       */
      const metadata =
        await createFileMetadata(
          currentUser.uid,
          uploadedFile
        );

      /*
       * Step 3:
       * Merge both storage layers in UI state.
       */
      const enrichedFile = {
        ...uploadedFile,
        metadataId:
          metadata.id,
        storagePath:
          metadata.storagePath,
        metadataSynced: true,
      };

      setFiles((previousFiles) => [
        enrichedFile,
        ...previousFiles,
      ]);

      setMessage(
        "File uploaded successfully. File content is stored locally and metadata is saved in Firestore."
      );
    } catch (err) {
      console.error(
        "File upload error:",
        err
      );

      /*
       * Roll back local file when Firestore metadata
       * creation fails.
       */
      if (
        uploadedFile &&
        currentUser
      ) {
        try {
          deleteLocalFile(
            currentUser.uid,
            uploadedFile.id
          );
        } catch (rollbackError) {
          console.error(
            "Local upload rollback failed:",
            rollbackError
          );
        }
      }

      setError(
        err?.message ||
          "Unable to upload the selected file."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (file) => {
    if (!file?.dataUrl) {
      setError(
        "This file is not available for download."
      );
      return;
    }

    const link =
      document.createElement("a");

    link.href = file.dataUrl;
    link.download = file.name;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const handleDelete = async (file) => {
    if (!currentUser || !file) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${file.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      /*
       * Delete Firestore metadata first.
       */
      if (file.metadataId) {
        await deleteFileMetadata(
          file.metadataId
        );
      }

      /*
       * Delete actual file from local simulation.
       */
      deleteLocalFile(
        currentUser.uid,
        file.id
      );

      /*
       * Remove from UI.
       */
      setFiles((previousFiles) =>
        previousFiles.filter(
          (item) => item.id !== file.id
        )
      );

      setMessage(
        "File and its Firestore metadata were deleted successfully."
      );
    } catch (err) {
      console.error(
        "File delete error:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete the selected file."
      );
    }
  };

  const getFileIcon = (type) => {
    if (type?.startsWith("image/")) {
      return (
        <FileImage size={21} />
      );
    }

    return (
      <FileText size={21} />
    );
  };

  return (
    <section className="page-container">
      <div className="page-header">
        <span className="page-eyebrow">
          FILE STORAGE
        </span>

        <h1>Cloud Files</h1>

        <p>
          Upload optional food or meal-related demo
          files and manage them from your account.
        </p>
      </div>

      {/* Storage information */}
      <div className="storage-info-panel">
        <div className="storage-info-icon">
          <Cloud size={22} />
        </div>

        <div>
          <h3>
            Cloud storage simulation
          </h3>

          <p>
            Firebase Authentication and Firestore
            are running in the cloud. Because the
            current Firebase setup does not use
            Firebase Cloud Storage, uploaded file
            content is stored locally in your browser.
          </p>

          <p className="mt-2">
            Each uploaded file's metadata is stored
            in the Firestore{" "}
            <strong>userFiles</strong> collection
            with user ID, filename, storage path,
            upload time, file size, and content type.
          </p>
        </div>
      </div>

      {message && (
        <div className="file-success-message">
          <CheckCircle2 size={18} />

          <span>
            {message}
          </span>
        </div>
      )}

      {error && (
        <div className="dashboard-error">
          <CircleAlert size={18} />

          <span>
            {error}
          </span>
        </div>
      )}

      {/* Upload */}
      <div className="dashboard-panel upload-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-label">
              OBJECT STORAGE DEMO
            </span>

            <h2>
              Upload a File
            </h2>
          </div>

          <div className="panel-icon">
            <Upload size={20} />
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.txt"
          onChange={handleFileChange}
          hidden
        />

        <button
          type="button"
          className="upload-dropzone"
          onClick={handleChooseFile}
          disabled={uploading}
        >
          <div className="upload-dropzone-icon">
            <Upload size={25} />
          </div>

          <strong>
            {uploading
              ? "Uploading..."
              : "Choose a file to upload"}
          </strong>

          <span>
            JPG, PNG, WEBP, PDF or TXT · Max 2 MB
          </span>
        </button>
      </div>

      {/* File list */}
      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-label">
              YOUR FILES
            </span>

            <h2>
              Uploaded Files{" "}
              <span className="file-count">
                {files.length}
              </span>
            </h2>
          </div>

          <div className="panel-icon">
            <Cloud size={20} />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Cloud size={24} />
            </div>

            <h3>
              Loading files...
            </h3>

            <p>
              Loading your local files and
              Firestore metadata.
            </p>
          </div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Cloud size={24} />
            </div>

            <h3>
              No uploaded files
            </h3>

            <p>
              Upload a small demo food image,
              PDF, or text file to test the
              storage workflow.
            </p>
          </div>
        ) : (
          <div className="uploaded-files-list">
            {files.map((file) => (
              <article
                className="uploaded-file-item"
                key={file.id}
              >
                <div className="uploaded-file-icon">
                  {getFileIcon(
                    file.type
                  )}
                </div>

                <div className="uploaded-file-content">
                  <strong
                    title={file.name}
                  >
                    {file.name}
                  </strong>

                  <span>
                    {formatFileSize(
                      file.size
                    )}
                    {" · "}
                    {new Date(
                      file.uploadedAt
                    ).toLocaleDateString()}
                    {" · "}
                    {file.metadataSynced
                      ? "Firestore metadata"
                      : "Metadata pending"}
                  </span>
                </div>

                <div className="uploaded-file-actions">
                  <button
                    type="button"
                    className="file-action-button"
                    onClick={() =>
                      handleDownload(file)
                    }
                    title="Download"
                    aria-label={`Download ${file.name}`}
                  >
                    <Download
                      size={17}
                    />
                  </button>

                  <button
                    type="button"
                    className="file-action-button danger"
                    onClick={() =>
                      handleDelete(file)
                    }
                    title="Delete"
                    aria-label={`Delete ${file.name}`}
                  >
                    <Trash2
                      size={17}
                    />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CloudFiles;