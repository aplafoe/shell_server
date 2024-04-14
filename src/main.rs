use actix_web::{App, HttpServer};

mod methods;
mod helpers;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(methods::cpu_usage)
            .service(methods::ram_usage)
            .service(methods::disk_usage)
            .service(methods::net_info)
            .service(methods::shell_command)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
