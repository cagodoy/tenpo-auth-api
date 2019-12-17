# Auth-API

Microservice implemented in Typecript that allows authenticating access to the backend through a JWT token. On the other hand, it manages user signup and login.

## Table

```
   Column   |           Type           | Collation | Nullable |      Default
------------+--------------------------+-----------+----------+-------------------
 id         | uuid                     |           | not null | gen_random_uuid()
 user_id    | character varying(255)   |           | not null |
 token      | character varying(255)   |           | not null |
 backlist   | boolean                  |           | not null | false
 created_at | timestamp with time zone |           |          | now()
 updated_at | timestamp with time zone |           |          | now()
 deleted_at | timestamp with time zone |           |          |
Indexes:
    "auth_pkey" PRIMARY KEY, btree (id)
Triggers:
    update_auth_update_at BEFORE UPDATE ON auth FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()
```

## GRPC Service

```go
service AuthService {
  rpc VerifyToken (AuthVerifyTokenRequest) returns (AuthVerifyTokenResponse) {}
  rpc Login (AuthLoginRequest) returns (AuthLoginResponse) {}
  rpc SignUp (AuthSignupRequest) returns (AuthSignupResponse) {}

  //
  // TODO(ca): below methods are not implemented.
  //
  // rpc Logout (AuthLogoutRequest) returns (AuthLogoutResponse) {}
  // rpc ForgotPassword (AuthForgotPasswordRequest) returns (AuthForgotPasswordResponse) {}
  // rpc RecoverPassword (AuthRecoverPasswordRequest) returns (AuthRecoverPasswordResponse) {}
}

message Token {
  string token = 1;
}

message AuthVerifyTokenRequest {
  string token = 1;
}

message AuthVerifyTokenResponse {
  bool valid = 1;
  Error error = 2;
}

message AuthLoginRequest {
  string email = 1;
  string password = 2;
}

message AuthLoginResponse {
  User data = 1;
  Token meta = 2;
  Error error = 3;
}

message AuthSignupRequest {
  User user = 1;
}

message AuthSignupResponse {
  User data = 1;
  Token meta = 2;
  Error error = 3;
}
```

## Commands (Development)

`make build`: build restaurants service for osx.

`make linux`: build restaurants service for linux os.

`make docker .`: build docker.

`docker run -it -p 5030:5030 tenpo-auth-api`: run docker.

`PORT=<port> JWT_SECRET=<jwt_secret> USERS_HOST=<users_host> USERS_PORT=<users_port> make r`: run tenpo auth service.
