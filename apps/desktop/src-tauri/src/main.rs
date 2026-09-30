#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod storage;

use rusqlite::Connection;
use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

#[tauri::command]
fn hide_quick_window(app: tauri::AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("quick")
        .ok_or_else(|| "Quick editor window is unavailable".to_string())?;
    window.hide().map_err(|error| error.to_string())
}

#[tauri::command]
fn show_main_window(app: tauri::AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "Main window is unavailable".to_string())?;
    window.show().map_err(|error| error.to_string())?;
    window.set_focus().map_err(|error| error.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if let Some(window) = app.get_webview_window("quick") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            app.global_shortcut()
                .register("CmdOrCtrl+Shift+M")
                .map_err(std::io::Error::other)?;
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
            hide_quick_window,
            show_main_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running VietMath");
}
