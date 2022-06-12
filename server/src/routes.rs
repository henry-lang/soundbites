use crate::db::DbConn;
use crate::models::{NewUser, User};
use crate::schema::users;
use diesel::prelude::*;
use diesel::PgConnection;
use diesel::Queryable;
use users::dsl::users as users_table;

use rocket_contrib::json::Json;
use serde_json::Value;

pub fn get_by_username(username: &str, conn: &PgConnection) -> Vec<User> {
    users_table
        .filter(users::username.eq(username))
        .load(conn)
        .expect("error!")
}

pub fn insert_user(user: NewUser, conn: &PgConnection) -> bool {
    diesel::insert_into(users::table)
        .values(&user)
        .execute(conn)
        .is_ok()
}
#[get("/users")]
pub fn get_all_users(conn: DbConn) -> Json<Value> {
    let users = users_table
        .order(users::id.desc())
        .load::<User>(&*conn)
        .expect("error!");

    Json(json! ({
        "status": 200,
        "result": users
    }))
}

#[post("/new_user", data = "<new_user>")]
pub fn new_user(conn: DbConn, new_user: Json<NewUser>) -> Json<Value> {
    let new_user = new_user.into_inner();

    Json(json! ({
        "status": diesel::insert_into(users::table)
            .values(new_user)
            .execute(&*conn)
            .is_ok()
    }))
}
