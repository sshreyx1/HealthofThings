import boto3
import base64
import hashlib
from botocore.exceptions import ClientError

# Cognito Configuration
user_pool_config = {
    "doctor": {
        "client_id": "65llfdchmed5me28oalsom6357",  # Replace with Doctor App Client ID
        "user_pool_id": "us-east-1_rZugm688I",  # Replace with Doctor User Pool ID
        "client_secret": "1m09ctki4d30kdu7ov0haov4dfj7fpsrhqtg113i13h8ugm8br3t",  # Replace with Doctor App Client Secret
    },
    "patient": {
        "client_id": "4d0q8v1fbgpfguc9hu4rhchmfb",  # Replace with Patient App Client ID
        "user_pool_id": "us-east-1_IUlJbP0XV",  # Replace with Patient User Pool ID
        "client_secret": "ur2brg1t0gs2h0619llp3fvqu5a5jf4ish1gsem9pn58gpk0q3t",  # Replace with Patient App Client Secret
    },
}

# Generate Secret Hash
def generate_secret_hash(username, client_id, client_secret):
    message = username + client_id
    digest = hmac.new(client_secret.encode(), message.encode(), hashlib.sha256).digest()
    return base64.b64encode(digest).decode()

# Login Function
def login_user(role, username, password):
    if role not in user_pool_config:
        print("Invalid role. Use 'doctor' or 'patient'.")
        return

    config = user_pool_config[role]
    client_id = config["client_id"]
    client_secret = config["client_secret"]
    secret_hash = generate_secret_hash(username, client_id, client_secret)

    # Initialize Cognito client
    client = boto3.client("cognito-idp")

    try:
        response = client.initiate_auth(
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": username,
                "PASSWORD": password,
                "SECRET_HASH": secret_hash,
            },
            ClientId=client_id,
        )
        print(f"Login successful for {username} ({role})!")
        print("Access Token:", response["AuthenticationResult"]["AccessToken"])
        print("Refresh Token:", response["AuthenticationResult"]["RefreshToken"])
    except ClientError as e:
        print(f"Login failed: {e.response['Error']['Message']}")

# Example Usage
if __name__ == "__main__":
    # Replace these with user inputs
    user_role = input("Enter role (doctor/patient): ").strip().lower()
    user_name = input("Enter username: ").strip()
    user_password = input("Enter password: ").strip()

    login_user(user_role, user_name, user_password)
