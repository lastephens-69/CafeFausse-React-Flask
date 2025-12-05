-- Run this after creating your 'cafe_fausse' database
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    newsletter_signup BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    time_slot TIMESTAMPTZ NOT NULL,
    table_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_timeslot_table UNIQUE (time_slot, table_number)
);

-- Helpful index for availability checks
CREATE INDEX IF NOT EXISTS idx_reservations_timeslot ON reservations(time_slot);
