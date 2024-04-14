use actix_web::{error, http::{header::ContentType, StatusCode}, HttpResponse};
use serde::{Deserialize, Serialize};
use derive_more::{Display, Error};

#[derive(Display, Debug, Error)]
pub enum Error {
    InternalError,
}

pub type RequestResult<T> = Result<T, Error>;

impl error::ResponseError for Error {
    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code())
            .insert_header(ContentType::html())
            .body(self.to_string())
    }

    fn status_code(&self) -> StatusCode {
        match *self {
            Error::InternalError => StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

#[derive(Serialize)]
pub struct CpuUsageResponse {
    pub cpu_usage : f32
}

#[derive(Serialize)]
pub struct RamUsageResponse {
    pub total_memory : u64,
    pub used_memory : u64
}

#[derive(Serialize)]
pub struct DiskInfo {
    pub name : String,
    pub filesystem: String,
    pub total_space : u64,
    pub available_space: u64
}

#[derive(Serialize)]
pub struct Networker {
    pub name : String,
    pub mac_address : String,
    pub bytes_received : u64,
    pub bytes_transmitted : u64
}

#[derive(Serialize)]
pub struct ShellResponse {
    pub output: String
}

#[derive(Deserialize)]
pub struct ShellCommand {
    pub target : String,
    pub command_name : String,
    pub args : Vec<String>
}