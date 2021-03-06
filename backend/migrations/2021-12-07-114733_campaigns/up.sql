CREATE TABLE campaigns (
	id SERIAL PRIMARY KEY,
	organisation_id INTEGER NOT NULL REFERENCES organisations (id),
	name TEXT NOT NULL,
	cover_image BYTEA,
	description TEXT NOT NULL,
	starts_at TIMESTAMP NOT NULL,
	ends_at TIMESTAMP NOT NULL,
	published BOOLEAN NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT diesel_manage_updated_at('campaigns');
