use diesel::pg::PgConnection;
use r2d2_diesel::ConnectionManager;
use rocket::{
    http::Status,
    request::{self, FromRequest},
    Outcome, Request, State,
};

use std::ops::Deref;

pub struct Pool(r2d2::Pool<ConnectionManager<PgConnection>>);

impl Pool {
    pub fn new(db_url: &str) -> Self {
        let manager = ConnectionManager::<PgConnection>::new(db_url);

        Self(r2d2::Pool::new(manager).expect("db pool failure"))
    }
}

pub struct DbConn(pub r2d2::PooledConnection<ConnectionManager<PgConnection>>);

impl<'a, 'r> FromRequest<'a, 'r> for DbConn {
    type Error = ();

    fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, ()> {
        let pool = request.guard::<State<Pool>>()?;
        match pool.0.get() {
            Ok(conn) => Outcome::Success(Self(conn)),
            Err(_) => Outcome::Failure((Status::ServiceUnavailable, ())),
        }
    }
}

impl Deref for DbConn {
    type Target = PgConnection;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
