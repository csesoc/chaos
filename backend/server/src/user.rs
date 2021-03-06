use crate::database::{
    models::{Application, Campaign, OrganisationUser, User},
    Database,
};
use crate::error::JsonErr;
use diesel::PgConnection;
use rocket::{
    get,
    http::Status,
    serde::{json::Json, Serialize},
};

#[derive(Serialize)]
pub struct UserResponse {
    email: String,
    zid: String,
    display_name: String,
    degree_name: String,
    degree_starting_year: i32,
}

#[derive(Serialize)]
pub enum UserError {
    UserNotFound,
    CampaignNotFound,
    PermissionDenied,
}

fn user_is_boss(boss_user: &User, user: &User, conn: &PgConnection) -> bool {
    if boss_user.id == user.id {
        return true;
    }

    let apps = Application::get_all_from_user_id(conn, user.id);
    for app in &apps {
        let boss_mode = OrganisationUser::role_admin_level(app.role_id, boss_user.id, conn)
            .is_at_least_director()
            .check()
            .is_ok();
        if boss_mode {
            return true;
        }
    }
    false
}

#[get("/")]
pub async fn get(user: User) -> Json<UserResponse> {
    Json(UserResponse {
        email: user.email,
        zid: user.zid,
        display_name: user.display_name,
        degree_name: user.degree_name,
        degree_starting_year: user.degree_starting_year,
    })
}

#[get("/<user_id>")]
pub async fn get_user(
    user_id: i32,
    user: User,
    db: Database,
) -> Result<Json<UserResponse>, JsonErr<UserError>> {
    db.run(move |conn| {
        let res = User::get_from_id(&conn, user_id)
            .ok_or(JsonErr(UserError::UserNotFound, Status::NotFound))?;

        if user_is_boss(&user, &res, conn) {
            Ok(Json(UserResponse {
                email: user.email,
                zid: user.zid,
                display_name: user.display_name,
                degree_name: user.degree_name,
                degree_starting_year: user.degree_starting_year,
            }))
        } else {
            Err(JsonErr(UserError::PermissionDenied, Status::Forbidden))
        }
    })
    .await
}

#[get("/campaigns")]
pub async fn get_user_campaigns(user: User, db: Database) -> Json<Vec<Campaign>> {
    let campaigns = db.run(move |conn| user.get_all_campaigns(conn)).await;

    Json(campaigns)
}
