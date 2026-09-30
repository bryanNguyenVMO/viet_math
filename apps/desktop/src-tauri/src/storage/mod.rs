use rusqlite::{params, Connection, OptionalExtension};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

pub struct StorageState {
    connection: Mutex<Connection>,
}

impl StorageState {
    pub fn new(connection: Connection) -> Self {
        Self {
            connection: Mutex::new(connection),
        }
    }
}

fn now_millis() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as i64
}

pub fn migrate(connection: &Connection) -> Result<(), String> {
    let version: i64 = connection
        .query_row("PRAGMA user_version", [], |row| row.get(0))
        .map_err(|error| error.to_string())?;

    if version < 1 {
        connection
            .execute_batch(
                "
                CREATE TABLE IF NOT EXISTS equations (
                    id TEXT PRIMARY KEY NOT NULL,
                    document_json TEXT NOT NULL,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL,
                    last_opened_at INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS drafts (
                    key TEXT PRIMARY KEY NOT NULL,
                    document_json TEXT NOT NULL,
                    updated_at INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY NOT NULL,
                    value TEXT NOT NULL
                );
                PRAGMA user_version = 1;
                ",
            )
            .map_err(|error| error.to_string())?;
    }

    Ok(())
}

fn connection<'a>(state: &'a State<'a, StorageState>) -> Result<std::sync::MutexGuard<'a, Connection>, String> {
    state
        .connection
        .lock()
        .map_err(|_| "Storage connection lock is poisoned".to_string())
}

#[tauri::command]
pub fn save_draft(
    state: State<'_, StorageState>,
    key: String,
    document_json: String,
) -> Result<(), String> {
    let connection = connection(&state)?;
    connection
        .execute(
            "INSERT INTO drafts (key, document_json, updated_at)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(key) DO UPDATE SET
               document_json = excluded.document_json,
               updated_at = excluded.updated_at",
            params![key, document_json, now_millis()],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_draft(
    state: State<'_, StorageState>,
    key: String,
) -> Result<Option<String>, String> {
    let connection = connection(&state)?;
    connection
        .query_row(
            "SELECT document_json FROM drafts WHERE key = ?1",
            params![key],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn clear_draft(state: State<'_, StorageState>, key: String) -> Result<(), String> {
    let connection = connection(&state)?;
    connection
        .execute("DELETE FROM drafts WHERE key = ?1", params![key])
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn save_setting(
    state: State<'_, StorageState>,
    key: String,
    value: String,
) -> Result<(), String> {
    let connection = connection(&state)?;
    connection
        .execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![key, value],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_setting(
    state: State<'_, StorageState>,
    key: String,
) -> Result<Option<String>, String> {
    let connection = connection(&state)?;
    connection
        .query_row(
            "SELECT value FROM settings WHERE key = ?1",
            params![key],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn save_equation(
    state: State<'_, StorageState>,
    id: String,
    document_json: String,
    created_at: i64,
    updated_at: i64,
    last_opened_at: i64,
) -> Result<(), String> {
    let connection = connection(&state)?;
    connection
        .execute(
            "INSERT INTO equations (id, document_json, created_at, updated_at, last_opened_at)
             VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(id) DO UPDATE SET
               document_json = excluded.document_json,
               updated_at = excluded.updated_at,
               last_opened_at = excluded.last_opened_at",
            params![id, document_json, created_at, updated_at, last_opened_at],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_equation(
    state: State<'_, StorageState>,
    id: String,
) -> Result<Option<(String, i64, i64, i64)>, String> {
    let connection = connection(&state)?;
    connection
        .query_row(
            "SELECT document_json, created_at, updated_at, last_opened_at
             FROM equations WHERE id = ?1",
            params![id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
        )
        .optional()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn list_recent_equations(
    state: State<'_, StorageState>,
    limit: i64,
) -> Result<Vec<(String, String, i64, i64, i64)>, String> {
    let connection = connection(&state)?;
    let mut statement = connection
        .prepare(
            "SELECT id, document_json, created_at, updated_at, last_opened_at
             FROM equations
             ORDER BY last_opened_at DESC
             LIMIT ?1",
        )
        .map_err(|error| error.to_string())?;

    let rows = statement
        .query_map(params![limit.max(0)], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
            ))
        })
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}
