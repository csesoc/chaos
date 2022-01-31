use crate::database::{
    models::{
        Campaign, CampaignWithRoles, NewCampaignInput, OrganisationAdmin, OrganisationUser, Role,
        UpdateCampaignInput, User,
    },
    schema::AdminLevel,
    Database,
};

use serde::Serialize;

use rocket::{delete, form::Form, get, post, put, serde::json::Json};

#[derive(Serialize)]
pub enum CampaignError {
    CampaignNotFound,
    Unauthorized,
    UnableToCreate,
}

#[get("/<campaign_id>")]
pub async fn get(campaign_id: i32, db: Database) -> Result<Json<Campaign>, Json<CampaignError>> {
    let campaign = db
        .run(move |conn| Campaign::get_from_id(conn, campaign_id))
        .await;

    match campaign {
        Some(campaign) => Ok(Json(campaign)),
        None => Err(Json(CampaignError::CampaignNotFound)),
    }
}

#[derive(Serialize)]
pub struct DashboardCampaignGroupings {
    pub current_campaigns: Vec<CampaignWithRoles>,
    pub past_campaigns: Vec<CampaignWithRoles>,
}

#[get("/all")]
pub async fn get_all_campaigns(user: User, db: Database) -> Json<DashboardCampaignGroupings> {
    let current_campaigns = db
        .run(move |conn| Campaign::get_all_public_with_roles(conn, user.id))
        .await;
    let past_campaigns = db
        .run(move |conn| Campaign::get_all_public_ended_with_roles(conn, user.id))
        .await;

    Json(DashboardCampaignGroupings {
        current_campaigns,
        past_campaigns,
    })
}

#[put("/<campaign_id>", data = "<update_campaign>")]
pub async fn update(
    campaign_id: i32,
    update_campaign: Form<UpdateCampaignInput>,
    user: User,
    db: Database,
) -> Result<Json<()>, Json<CampaignError>> {
    let campaign = db
        .run(move |conn| Campaign::get_from_id(conn, campaign_id))
        .await
        .ok_or(Json(CampaignError::CampaignNotFound))?;

    let org_user = db
        .run(move |conn| OrganisationUser::get(conn, campaign.organisation_id, user.id))
        .await
        .ok_or(Json(CampaignError::Unauthorized))?;

    // only allow update if admin_level is not AdminLevel::ReadOnly
    // ie only director, Admin (exec) or SuperUser can perform this action
    if !user.superuser && org_user.admin_level == AdminLevel::ReadOnly {
        return Err(Json(CampaignError::Unauthorized));
    }

    db.run(move |conn| Campaign::update(conn, campaign_id, &update_campaign))
        .await;

    Ok(Json(()))
}

#[post("/new", data = "<new_campaign>")]
pub async fn create(
    new_campaign: Json<NewCampaignInput>,
    user: User,
    db: Database,
) -> Result<Json<Campaign>, Json<CampaignError>> {
    let inner = new_campaign.into_inner();
    let org_user = db
        .run(move |conn| OrganisationUser::get(conn, inner.organisation_id, user.id))
        .await;

    let org_user = org_user.ok_or(Json(CampaignError::Unauthorized))?;

    // only allow update if admin_level is not AdminLevel::ReadOnly
    // ie only director, Admin (exec) or SuperUser can perform this action
    if !user.superuser && org_user.admin_level == AdminLevel::ReadOnly {
        return Err(Json(CampaignError::Unauthorized));
    }

    let campaign = db
        .run(move |conn| Campaign::create(conn, &inner))
        .await
        .ok_or(Json(CampaignError::UnableToCreate))?;

    Ok(Json(campaign))
}

#[delete("/<campaign_id>")]
pub async fn delete_campaign(
    campaign_id: i32,
    user: User,
    db: Database,
) -> Result<Json<()>, Json<CampaignError>> {
    let admin_res = db
        .run(move |conn| OrganisationAdmin::new_from_campaign_id(user, campaign_id, conn))
        .await;

    match admin_res {
        Ok(_admin) => {
            db.run(move |conn| Campaign::delete_deep(conn, campaign_id))
                .await;
            Ok(Json(()))
        }
        Err(_) => Err(Json(CampaignError::Unauthorized)),
    }
}

#[derive(Serialize)]
pub struct RolesResponse {
    roles: Vec<Role>,
}

#[derive(Serialize)]
pub enum RolesError {
    CampaignNotFound,
    Unauthorized,
    RoleAlreadyExists,
}

#[get("/<campaign_id>/roles")]
pub async fn roles(
    campaign_id: i32,
    user: User,
    db: Database,
) -> Result<Json<RolesResponse>, Json<RolesError>> {
    let campaign = db
        .run(move |conn| Campaign::get_from_id(conn, campaign_id))
        .await;

    let campaign = campaign.ok_or(Json(RolesError::CampaignNotFound))?;

    let (org_user, roles) = db
        .run(move |conn| {
            (
                OrganisationUser::get(conn, campaign.organisation_id, user.id),
                Role::get_all_from_campaign_id(conn, campaign.id),
            )
        })
        .await;

    let permission = org_user
        .map(|user| user.admin_level)
        .unwrap_or(AdminLevel::ReadOnly);

    // Prevent people from viewing while it's in draft mode,
    // unless they have adequate permissions
    if campaign.published && !user.superuser && permission == AdminLevel::ReadOnly {
        return Err(Json(RolesError::Unauthorized));
    }

    Ok(Json(RolesResponse { roles }))
}
