import os
import jwt
import json
import base64
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

def verify_jwt(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    try:
        token = credentials.credentials
        # Try to decode as base64 (simple auth)
        try:
            payload = json.loads(base64.b64decode(token))
            user_id = payload.get("sub")
            if user_id:
                return user_id
        except:
            pass
        # Try to decode as JWT
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def enforce_ownership(token_user_id: str, path_user_id: str):
    if token_user_id != path_user_id:
        raise HTTPException(status_code=403, detail="Access denied")
