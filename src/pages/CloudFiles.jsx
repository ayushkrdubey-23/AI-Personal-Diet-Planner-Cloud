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

function CloudFiles() {
  const { currentUser } = useAuth();

  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const savedFiles = getLocalFiles(
      currentUser.uid
    );

    setFiles(savedFiles);
  }, [currentUser]);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    // Allow the same file to be selected again
    event.target.value = "";

    if (!selectedFile || !currentUser) {
      return;
    }

    setMessage("");
    setError("");

    // Demo safety limit for browser localStorage
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

    try {
      setUploading(true);

      const uploadedFile =
        await uploadLocalFile(
          currentUser.uid,
          selectedFile
        );

      setFiles((previousFiles) => [
        uploadedFile,
        ...previousFiles,
      ]);

      setMessage(
        "File uploaded successfully using local storage simulation."
      );
    } catch (err) {
      console.error(
        "File upload error:",
        err
      );

      setError(
        "Unable to upload the selected file."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (file) => {
    const link =
      document.createElement("a");

    link.href = file.dataUrl;

    link.download = file.name;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const handleDelete = (fileId) => {
    if (!currentUser) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this file?"
    );

    if (!confirmed) {
      return;
    }

    try {
      deleteLocalFile(
        currentUser.uid,
        fileId
      );

      setFiles((previousFiles) =>
        previousFiles.filter(
          (file) => file.id !== fileId
        )
      );

      setMessage(
        "File deleted successfully."
      );
    } catch (err) {
      console.error(
        "File delete error:",
        err
      );

      setError(
        "Unable to delete the selected file."
      );
    }
  };

  const getFileIcon = (type) => {
    if (type?.startsWith("image/")) {
      return <FileImage size={21} />;
    }

    return <FileText size={21} />;
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
            Free local storage simulation
          </h3>

          <p>
            Firebase Authentication and Firestore are
            running in the cloud. Because Cloud Storage
            requires billing in the current Firebase
            setup, uploaded demo file content is stored
            locally in your browser for this version.
          </p>
        </div>
      </div>

      {message && (
        <div className="file-success-message">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="dashboard-error">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload */}
      <div className="dashboard-panel upload-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-label">
              OBJECT STORAGE DEMO
            </span>

            <h2>Upload a File</h2>
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

        {files.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Cloud size={24} />
            </div>

            <h3>No uploaded files</h3>

            <p>
              Upload a small demo food image, PDF, or
              text file to test the storage workflow.
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
                  {getFileIcon(file.type)}
                </div>

                <div className="uploaded-file-content">
                  <strong title={file.name}>
                    {file.name}
                  </strong>

                  <span>
                    {formatFileSize(file.size)}
                    {" · "}
                    {new Date(
                      file.uploadedAt
                    ).toLocaleDateString()}
                    {" · "}
                    Local storage
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
                    <Download size={17} />
                  </button>

                  <button
                    type="button"
                    className="file-action-button danger"
                    onClick={() =>
                      handleDelete(file.id)
                    }
                    title="Delete"
                    aria-label={`Delete ${file.name}`}
                  >
                    <Trash2 size={17} />
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