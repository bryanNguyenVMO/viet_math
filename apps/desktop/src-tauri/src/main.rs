#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod storage;

use rusqlite::Connection;
use std::borrow::Cow;
use std::path::{Path, PathBuf};
use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

#[tauri::command]
fn write_clipboard_text(text: String) -> Result<(), String> {
    let mut clipboard = arboard::Clipboard::new().map_err(|error| error.to_string())?;
    clipboard
        .set_text(text)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn write_clipboard_image(png: Vec<u8>) -> Result<(), String> {
    let decoded = image::load_from_memory_with_format(&png, image::ImageFormat::Png)
        .map_err(|error| error.to_string())?
        .to_rgba8();
    let (width, height) = decoded.dimensions();
    let data = arboard::ImageData {
        width: width as usize,
        height: height as usize,
        bytes: Cow::Owned(decoded.into_raw()),
    };

    let mut clipboard = arboard::Clipboard::new().map_err(|error| error.to_string())?;
    clipboard
        .set_image(data)
        .map_err(|error| error.to_string())
}

fn unique_export_path(download_dir: &Path, filename: &str) -> PathBuf {
    let requested = Path::new(filename);
    let stem = requested
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or("vietmath");
    let extension = requested.extension().and_then(|value| value.to_str());

    let direct = download_dir.join(filename);
    if !direct.exists() {
        return direct;
    }

    for index in 1..1000 {
        let next_name = match extension {
            Some(extension) => format!("{stem}-{index}.{extension}"),
            None => format!("{stem}-{index}"),
        };
        let candidate = download_dir.join(next_name);
        if !candidate.exists() {
            return candidate;
        }
    }

    download_dir.join(format!("{stem}-export"))
}

#[tauri::command]
fn save_export_file(
    app: tauri::AppHandle,
    filename: String,
    bytes: Vec<u8>,
) -> Result<String, String> {
    let safe_name = Path::new(&filename)
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "Invalid export filename".to_string())?;
    let download_dir = app
        .path()
        .download_dir()
        .map_err(|error| error.to_string())?;
    std::fs::create_dir_all(&download_dir).map_err(|error| error.to_string())?;

    let path = unique_export_path(&download_dir, safe_name);
    std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

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
            storage::set_equation_favorite,
            storage::list_favorite_equations,
            write_clipboard_text,
            write_clipboard_image,
            save_export_file,
            hide_quick_window,
            show_main_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running VietMath");
}
