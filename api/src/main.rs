#![feature(decl_macro)]

#[macro_use]
extern crate diesel;

#[macro_use]
extern crate rocket;

#[macro_use]
extern crate serde_json;

mod db;
mod models;
mod routes;
mod schema;

use dotenv::dotenv;
use std::env;

use routes::*;

fn main() {
    dotenv().ok();

    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL not set");
    let pool = db::Pool::new(&db_url);

    rocket::ignite()
        .manage(pool)
        .mount("/api/", routes![get_all_users, new_user])
        .launch();
}
