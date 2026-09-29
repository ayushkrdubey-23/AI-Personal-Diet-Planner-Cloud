import os

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials


load_dotenv()


SERVICE_ACCOUNT_PATH = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_PATH",
    "backend/secrets/serviceAccountKey.json",
)


def initialize_firebase_admin():
    """
    Initialize Firebase Admin SDK only once.
    """

    if firebase_admin._apps:
        return firebase_admin.get_app()

    if not os.path.exists(SERVICE_ACCOUNT_PATH):
        raise FileNotFoundError(
            "Firebase service account file was not found at: "
            f"{SERVICE_ACCOUNT_PATH}"
        )

    credential = credentials.Certificate(
        SERVICE_ACCOUNT_PATH
    )

    return firebase_admin.initialize_app(
        credential
    )
