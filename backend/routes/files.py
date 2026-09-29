from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from pydantic import BaseModel, Field

from backend.services.auth_service import get_current_user


router = APIRouter(
    tags=["Cloud Files"],
)


# ---------------------------------------------------------
# Request model
# ---------------------------------------------------------

class FileMetadataRequest(BaseModel):
    localFileId: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    filename: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    storagePath: str = Field(
        ...,
        min_length=1,
        max_length=500,
    )

    size: int = Field(
        default=0,
        ge=0,
    )

    contentType: str = Field(
        default="application/octet-stream",
        max_length=100,
    )

    storageMode: str = Field(
        default="local-simulation",
        max_length=100,
    )


# ---------------------------------------------------------
# Firestore helper
# ---------------------------------------------------------

def get_firestore_database():
    """
    Return the initialized Firebase Admin Firestore client.
    """

    try:
        return firestore.client()

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Cloud database is currently unavailable.",
        ) from exc


# ---------------------------------------------------------
# JSON-safe helper
# ---------------------------------------------------------

def make_json_safe(value: Any) -> Any:
    """
    Convert supported Firestore/Python values to JSON-safe data.
    """

    if isinstance(value, datetime):
        return value.isoformat()

    if isinstance(value, dict):
        return {
            key: make_json_safe(item)
            for key, item in value.items()
        }

    if isinstance(value, list):
        return [
            make_json_safe(item)
            for item in value
        ]

    return value


# ---------------------------------------------------------
# POST /upload
# ---------------------------------------------------------

@router.post("/upload")
async def upload_file_metadata(
    request: FileMetadataRequest,
    current_user: dict = Depends(
        get_current_user
    ),
):
    """
    Register metadata for a file uploaded through the
    browser's local-storage simulation.

    The actual file bytes are not stored by this endpoint
    in the current free/local version.
    """

    try:
        firebase_uid = current_user["uid"]

        db = get_firestore_database()

        collection_reference = db.collection(
            "userFiles"
        )

        # Prevent accidental duplicate metadata records
        # for the same authenticated user and local file.
        existing_query = (
            collection_reference
            .where(
                filter=firestore.FieldFilter(
                    "userId",
                    "==",
                    firebase_uid,
                )
            )
            .where(
                filter=firestore.FieldFilter(
                    "localFileId",
                    "==",
                    request.localFileId,
                )
            )
            .limit(1)
        )

        existing_documents = list(
            existing_query.stream()
        )

        if existing_documents:
            existing_document = (
                existing_documents[0]
            )

            existing_data = (
                existing_document.to_dict()
                or {}
            )

            existing_data["id"] = (
                existing_document.id
            )

            return make_json_safe(
                existing_data
            )

        uploaded_at = (
            datetime.now(
                timezone.utc
            ).isoformat()
        )

        file_data = {
            "userId": firebase_uid,
            "localFileId": request.localFileId,
            "filename": request.filename.strip(),
            "storagePath": request.storagePath.strip(),
            "size": request.size,
            "contentType": request.contentType.strip(),
            "storageMode": request.storageMode.strip(),
            "uploadedAt": uploaded_at,
        }

        document_reference = (
            collection_reference.add(
                file_data
            )
        )

        # Firebase Admin returns:
        # (write_result, document_reference)
        _, created_reference = (
            document_reference
        )

        file_data["id"] = (
            created_reference.id
        )

        return make_json_safe(
            file_data
        )

    except KeyError as exc:
        raise HTTPException(
            status_code=401,
            detail="Authenticated user UID was not found.",
        ) from exc

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to save file metadata.",
        ) from exc


# ---------------------------------------------------------
# GET /files
# ---------------------------------------------------------

@router.get("/files")
async def get_files(
    current_user: dict = Depends(
        get_current_user
    ),
):
    """
    Retrieve all file metadata belonging to
    the authenticated user.
    """

    try:
        firebase_uid = current_user["uid"]

        db = get_firestore_database()

        collection_reference = db.collection(
            "userFiles"
        )

        files_query = collection_reference.where(
            filter=firestore.FieldFilter(
                "userId",
                "==",
                firebase_uid,
            )
        )

        documents = files_query.stream()

        files = []

        for document in documents:
            file_data = (
                document.to_dict()
                or {}
            )

            file_data["id"] = (
                document.id
            )

            files.append(
                make_json_safe(
                    file_data
                )
            )

        files.sort(
            key=lambda item: (
                item.get(
                    "uploadedAt",
                    "",
                )
            ),
            reverse=True,
        )

        return {
            "total": len(files),
            "files": files,
        }

    except KeyError as exc:
        raise HTTPException(
            status_code=401,
            detail="Authenticated user UID was not found.",
        ) from exc

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve file metadata.",
        ) from exc


# ---------------------------------------------------------
# DELETE /files/{file_id}
# ---------------------------------------------------------

@router.delete(
    "/files/{file_id}"
)
async def delete_file(
    file_id: str,
    current_user: dict = Depends(
        get_current_user
    ),
):
    """
    Delete a file metadata record belonging to
    the authenticated user.
    """

    try:
        firebase_uid = current_user["uid"]

        if not file_id.strip():
            raise HTTPException(
                status_code=400,
                detail="File ID cannot be empty.",
            )

        db = get_firestore_database()

        document_reference = (
            db.collection("userFiles")
            .document(file_id)
        )

        document = (
            document_reference.get()
        )

        if not document.exists:
            raise HTTPException(
                status_code=404,
                detail="File metadata not found.",
            )

        file_data = (
            document.to_dict()
            or {}
        )

        # Explicit user isolation.
        if (
            file_data.get("userId")
            != firebase_uid
        ):
            raise HTTPException(
                status_code=404,
                detail="File metadata not found.",
            )

        document_reference.delete()

        return {
            "message": (
                "File metadata deleted successfully."
            ),
            "fileId": file_id,
        }

    except KeyError as exc:
        raise HTTPException(
            status_code=401,
            detail="Authenticated user UID was not found.",
        ) from exc

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to delete file metadata.",
        ) from exc