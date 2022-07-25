use serde_derive::{Deserialize, Serialize};

use crate::schema::users;

#[derive(Serialize, Queryable)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Insertable)]
#[table_name = "users"]
pub struct NewUser {
    pub username: String,
    pub password: String,
}
