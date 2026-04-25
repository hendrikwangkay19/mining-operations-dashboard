-- Users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK(role IN ('Operations Lead','Safety Officer','Maintenance Planner')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Fleet units
CREATE TABLE IF NOT EXISTS fleet_units (
  id           TEXT PRIMARY KEY,
  type         TEXT NOT NULL,
  site         TEXT NOT NULL,
  operator     TEXT,
  status       TEXT NOT NULL DEFAULT 'Standby' CHECK(status IN ('Active','Standby','Warning','Maintenance')),
  fuel         INTEGER NOT NULL DEFAULT 100,
  hours        INTEGER NOT NULL DEFAULT 0,
  load         TEXT,
  last_service TEXT,
  gps          TEXT,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Production records (daily, per site)
CREATE TABLE IF NOT EXISTS production_records (
  id            SERIAL PRIMARY KEY,
  site          TEXT NOT NULL,
  material      TEXT NOT NULL,
  target        INTEGER NOT NULL,
  actual        INTEGER NOT NULL,
  quality       TEXT DEFAULT 'N/A',
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 7-day production trend
CREATE TABLE IF NOT EXISTS production_trend (
  id            SERIAL PRIMARY KEY,
  day           TEXT NOT NULL,
  overburden    INTEGER NOT NULL,
  coal          INTEGER NOT NULL,
  recorded_date DATE NOT NULL
);

-- Equipment utilization per type
CREATE TABLE IF NOT EXISTS fleet_utilization (
  id              SERIAL PRIMARY KEY,
  equipment_type  TEXT NOT NULL UNIQUE,
  utilization_pct INTEGER NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Safety indicators
CREATE TABLE IF NOT EXISTS safety_indicators (
  id            SERIAL PRIMARY KEY,
  area          TEXT NOT NULL,
  metric        TEXT NOT NULL,
  value         TEXT NOT NULL,
  status        TEXT NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Active alerts
CREATE TABLE IF NOT EXISTS alerts (
  id         SERIAL PRIMARY KEY,
  level      TEXT NOT NULL CHECK(level IN ('High','Medium','Low')),
  title      TEXT NOT NULL,
  area       TEXT NOT NULL,
  time       TEXT NOT NULL,
  is_active  INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance work orders
CREATE TABLE IF NOT EXISTS maintenance_orders (
  id         SERIAL PRIMARY KEY,
  unit_id    TEXT NOT NULL,
  type       TEXT NOT NULL,
  due_date   DATE NOT NULL,
  priority   TEXT NOT NULL CHECK(priority IN ('Urgent','High','Medium','Low')),
  owner      TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','In Progress','Completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shift operations log
CREATE TABLE IF NOT EXISTS shift_operations (
  id            SERIAL PRIMARY KEY,
  shift         TEXT NOT NULL,
  site          TEXT NOT NULL,
  activity      TEXT NOT NULL,
  target        TEXT NOT NULL,
  actual        TEXT NOT NULL,
  status        TEXT NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  message    TEXT NOT NULL,
  is_read    INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
