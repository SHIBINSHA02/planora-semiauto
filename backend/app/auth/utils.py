from flask_jwt_extended import create_access_token as jwt_create_access_token
from datetime import timedelta

def create_access_token(identity):
    """
    identity: dict with user info (e.g., {"email": "alice@example.com"})
    Returns a JWT token valid for 12 hours
    """
    return jwt_create_access_token(identity=identity, expires_delta=timedelta(hours=12))
