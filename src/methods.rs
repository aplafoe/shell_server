use actix_web::{get, post, web::Json};
use sysinfo::{Disks, Networks, System};
use std::process::Command;

use crate::helpers;

#[get("/cpu_usage")]
pub async fn cpu_usage() -> Json<helpers::CpuUsageResponse> {
    let mut sys_info = System::new();
    sys_info.refresh_all();
    sys_info.refresh_cpu();

    Json(helpers::CpuUsageResponse{cpu_usage : sys_info.global_cpu_info().cpu_usage()})
}

#[get("/ram_usage")]
pub async fn ram_usage() -> Json<helpers::RamUsageResponse> {
    let mut sys_info = System::new();
    sys_info.refresh_all();
    sys_info.refresh_memory();

    Json(helpers::RamUsageResponse{total_memory : sys_info.total_memory(), used_memory: sys_info.used_memory()})
}

#[get("/disk_usage")]
pub async fn disk_usage() -> Json<Vec<helpers::DiskInfo>> {
    Json(Disks::new_with_refreshed_list()
        .iter()
        .map(|disk|
            helpers::DiskInfo {
                name : format!("{:?}", disk.name()), 
                filesystem : format!("{:?}", disk.file_system()), 
                total_space : disk.total_space(), 
                available_space: disk.available_space()})
        .collect())
}

#[get("/net_info")]
pub async fn net_info() -> Json<Vec<helpers::Networker>> {
    Json(Networks::new_with_refreshed_list()
        .iter()
        .map(|(interface, data)| 
            helpers::Networker {
                name : interface.clone(),
                mac_address : data.mac_address().to_string(),
                bytes_received: data.total_received(),
                bytes_transmitted: data.total_transmitted(),})
        .collect())  
}

#[post("/shell_command")]
pub async fn shell_command(req : Json<helpers::ShellCommand>) -> helpers::RequestResult<Json<helpers::ShellResponse>> {

    let out = Command::new(&req.target)
    .arg(&req.command_name)
    .args(&req.args).output();

    match out {
        Ok(res) => Ok(Json(helpers::ShellResponse{output : String::from_utf8_lossy(&res.stdout).to_string()})),
        _ => Err(helpers::Error::InternalError),
    }
}

#[get("/set_time")]
pub async fn set_time() -> actix_web::Result<actix_files::NamedFile> {
    Ok(actix_files::NamedFile::open("static/set_time.html")?)
}