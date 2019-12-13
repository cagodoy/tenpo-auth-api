package auth

// Auth ...
type Auth struct {
	ID        string `json:"id" db:"id"`
	UserID    string `json:"user_id" db:"user_id"`
	Token     string `json:"token" db:"token"`
	Blacklist bool   `json:"backlist" db:"blacklist"`
}
