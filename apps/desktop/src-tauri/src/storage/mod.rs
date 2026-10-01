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

    if version < 2 {
        connection
            .execute_batch(
                "
                ALTER TABLE equations ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0;
                PRAGMA user_version = 2;
                ",
            )
            .map_err(|error| error.to_string())?;
    }

    if version < 3 {
        connection
            .execute_batch(
                "
                CREATE TABLE IF NOT EXISTS equation_revisions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    equation_id TEXT NOT NULL,
                    document_json TEXT NOT NULL,
                    created_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_equation_revisions_equation
                    ON equation_revisions(equation_id, id DESC);
                PRAGMA user_version = 3;
                ",
            )
            .map_err(|error| error.to_string())?;
    }

    if version < 4 {
        connection
            .execute_batch(
                "
                CREATE TABLE IF NOT EXISTS formula_collections (
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    created_at INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS collection_equations (
                    collection_id TEXT NOT NULL,
                    equation_id TEXT NOT NULL,
                    added_at INTEGER NOT NULL,
                    PRIMARY KEY (collection_id, equation_id)
                );
                CREATE INDEX IF NOT EXISTS idx_collection_equations_collection
                    ON collection_equations(collection_id, added_at DESC);
                PRAGMA user_version = 4;
                ",
            )
            .map_err(|error| error.to_string())?;
    }

    if version < 5 {
        connection
            .execute_batch(
                "
                ALTER TABLE equations ADD COLUMN title TEXT;
                PRAGMA user_version = 5;
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
    title: Option<String>,
    document_json: String,
    created_at: i64,
    updated_at: i64,
    last_opened_at: i64,
) -> Result<(), String> {
    let connection = connection(&state)?;

    let previous = connection
        .query_row(
            "SELECT document_json, updated_at FROM equations WHERE id = ?1",
            params![&id],
            |row| Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?)),
        )
        .optional()
        .map_err(|error| error.to_string())?;

    if let Some((previous_document, previous_updated_at)) = previous {
        if previous_document != document_json {
            connection
                .execute(
                    "INSERT INTO equation_revisions (equation_id, document_json, created_at)
                     VALUES (?1, ?2, ?3)",
                    params![&id, previous_document, previous_updated_at],
                )
                .map_err(|error| error.to_string())?;
            connection
                .execute(
                    "DELETE FROM equation_revisions
                     WHERE equation_id = ?1
                       AND id NOT IN (
                         SELECT id FROM equation_revisions
                         WHERE equation_id = ?1
                         ORDER BY id DESC
                         LIMIT 50
                       )",
                    params![&id],
                )
                .map_err(|error| error.to_string())?;
        }
    }

    connection
        .execute(
            "INSERT INTO equations (id, title, document_json, created_at, updated_at, last_opened_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)
             ON CONFLICT(id) DO UPDATE SET
               title = COALESCE(excluded.title, equations.title),
               document_json = excluded.document_json,
               updated_at = excluded.updated_at,
               last_opened_at = excluded.last_opened_at",
            params![id, title, document_json, created_at, updated_at, last_opened_at],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_equation(
    state: State<'_, StorageState>,
    id: String,
) -> Result<Option<(Option<String>, String, i64, i64, i64)>, String> {
    let connection = connection(&state)?;
    connection
        .query_row(
            "SELECT title, document_json, created_at, updated_at, last_opened_at
             FROM equations WHERE id = ?1",
            params![id],
            |row| Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
            )),
        )
        .optional()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn list_recent_equations(
    state: State<'_, StorageState>,
    limit: i64,
) -> Result<Vec<(String, Option<String>, String, i64, i64, i64)>, String> {
    let connection = connection(&state)?;
    let mut statement = connection
        .prepare(
            "SELECT id, title, document_json, created_at, updated_at, last_opened_at
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
                row.get(5)?,
            ))
        })
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn rename_equation(
    state: State<'_, StorageState>,
    id: String,
    title: Option<String>,
) -> Result<(), String> {
    let normalized = title
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());
    let connection = connection(&state)?;
    connection
        .execute(
            "UPDATE equations SET title = ?2 WHERE id = ?1",
            params![id, normalized],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_equation(
    state: State<'_, StorageState>,
    id: String,
) -> Result<(), String> {
    let connection = connection(&state)?;
    connection
        .execute(
            "DELETE FROM collection_equations WHERE equation_id = ?1",
            params![&id],
        )
        .map_err(|error| error.to_string())?;
    connection
        .execute(
            "DELETE FROM equation_revisions WHERE equation_id = ?1",
            params![&id],
        )
        .map_err(|error| error.to_string())?;
    connection
        .execute("DELETE FROM equations WHERE id = ?1", params![id])
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_equation_favorite(
    state: State<'_, StorageState>,
    id: String,
    favorite: bool,
) -> Result<(), String> {
    let connection = connection(&state)?;
    connection
        .execute(
            "UPDATE equations SET favorite = ?2 WHERE id = ?1",
            params![id, if favorite { 1 } else { 0 }],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_favorite_equations(
    state: State<'_, StorageState>,
) -> Result<Vec<(String, Option<String>, String, i64, i64, i64)>, String> {
    let connection = connection(&state)?;
    let mut statement = connection
        .prepare(
            "SELECT id, title, document_json, created_at, updated_at, last_opened_at
             FROM equations
             WHERE favorite = 1
             ORDER BY last_opened_at DESC",
        )
        .map_err(|error| error.to_string())?;

    let rows = statement
        .query_map([], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
            ))
        })
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn list_equation_revisions(
    state: State<'_, StorageState>,
    equation_id: String,
    limit: i64,
) -> Result<Vec<(i64, String, i64)>, String> {
    let connection = connection(&state)?;
    let mut statement = connection
        .prepare(
            "SELECT id, document_json, created_at
             FROM equation_revisions
             WHERE equation_id = ?1
             ORDER BY id DESC
             LIMIT ?2",
        )
        .map_err(|error| error.to_string())?;

    let rows = statement
        .query_map(params![equation_id, limit.max(0)], |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?))
        })
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}


#[tauri::command]
pub fn create_collection(
    state: State<'_, StorageState>,
    id: String,
    name: String,
    created_at: i64,
) -> Result<(), String> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("Collection name cannot be empty".to_string());
    }

    let connection = connection(&state)?;
    connection
        .execute(
            "INSERT INTO formula_collections (id, name, created_at)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(id) DO UPDATE SET name = excluded.name",
            params![id, trimmed, created_at],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_collections(
    state: State<'_, StorageState>,
) -> Result<Vec<(String, String, i64)>, String> {
    let connection = connection(&state)?;
    let mut statement = connection
        .prepare(
            "SELECT id, name, created_at
             FROM formula_collections
             ORDER BY created_at ASC, name ASC",
        )
        .map_err(|error| error.to_string())?;

    let rows = statement
        .query_map([], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)))
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn delete_collection(
    state: State<'_, StorageState>,
    id: String,
) -> Result<(), String> {
    let connection = connection(&state)?;
    connection
        .execute(
            "DELETE FROM collection_equations WHERE collection_id = ?1",
            params![&id],
        )
        .map_err(|error| error.to_string())?;
    connection
        .execute("DELETE FROM formula_collections WHERE id = ?1", params![id])
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn add_equation_to_collection(
    state: State<'_, StorageState>,
    collection_id: String,
    equation_id: String,
) -> Result<(), String> {
    let connection = connection(&state)?;

    let collection_exists: bool = connection
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM formula_collections WHERE id = ?1)",
            params![&collection_id],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())?;
    let equation_exists: bool = connection
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM equations WHERE id = ?1)",
            params![&equation_id],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())?;

    if !collection_exists || !equation_exists {
        return Err("Collection or equation not found".to_string());
    }

    connection
        .execute(
            "INSERT INTO collection_equations (collection_id, equation_id, added_at)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(collection_id, equation_id)
             DO UPDATE SET added_at = excluded.added_at",
            params![collection_id, equation_id, now_millis()],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn remove_equation_from_collection(
    state: State<'_, StorageState>,
    collection_id: String,
    equation_id: String,
) -> Result<(), String> {
    let connection = connection(&state)?;
    connection
        .execute(
            "DELETE FROM collection_equations
             WHERE collection_id = ?1 AND equation_id = ?2",
            params![collection_id, equation_id],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_collection_equations(
    state: State<'_, StorageState>,
    collection_id: String,
) -> Result<Vec<(String, Option<String>, String, i64, i64, i64)>, String> {
    let connection = connection(&state)?;
    let mut statement = connection
        .prepare(
            "SELECT e.id, e.title, e.document_json, e.created_at, e.updated_at, e.last_opened_at
             FROM collection_equations ce
             JOIN equations e ON e.id = ce.equation_id
             WHERE ce.collection_id = ?1
             ORDER BY ce.added_at DESC",
        )
        .map_err(|error| error.to_string())?;

    let rows = statement
        .query_map(params![collection_id], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
            ))
        })
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}
