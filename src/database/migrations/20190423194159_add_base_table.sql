-- +goose Up
-- +goose StatementBegin
CREATE TABLE auth (
  id uuid primary key default gen_random_uuid() UNIQUE,
  user_id varchar(255)  NOT NULL,
  token varchar(255) NOT NULL,
  backlist BOOLEAN NOT NULL DEFAULT FALSE,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create trigger update_auth_update_at
before update on auth for each row execute procedure update_updated_at_column();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS auth;
-- +goose StatementEnd
