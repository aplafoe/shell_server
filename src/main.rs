use actix_web::{App, HttpServer};
use actix_files as fs;
use std::env;

mod methods;
mod helpers;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let address = format!("{}:{}", env::var("SH_SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()), 
    env::var("SH_SERVER_PORT").unwrap_or_else(|_| "8080".to_string()));
    HttpServer::new(|| {
        App::new()
            .service(methods::cpu_usage)
            .service(methods::ram_usage)
            .service(methods::disk_usage)
            .service(methods::net_info)
            .service(methods::shell_command)
            .service(methods::set_time)
            .service(fs::Files::new("/", "static").index_file("index.html"))
    })
    .bind(address)?
    .run()
    .await
}
