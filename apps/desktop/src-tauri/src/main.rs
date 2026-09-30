#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod storage;

use rusqlite::Connection;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            let connection = Connection::open(data_dir.join("vietmath.db"))?;
            storage::migrate(&connection).map_err(std::io::Error::other)?;
            app.manage(storage::StorageState::new(connection));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            storage::save_draft,
            storage::load_draft,
            storage::clear_draft,
            storage::save_setting,
            storage::load_setting,
            storage::save_equation,
            storage::load_equation,
            storage::list_recent_equations,
        ])
        .run(tauri::generate_context!())
        .expect("error while running VietMath");
}
