import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Tabs, Tab } from "@mui/material";
import CampaignTab from "./Campaign";
import RolesTab from "./Roles";
import ReviewTab from "./Preview";
import { NextButton, ArrowIcon, NextWrapper } from "./createCampaign.styled";

const dateToString = (date) =>
  `${date.getFullYear()}-${
    date.getMonth() < 9 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`
  }-${
    date.getDate() < 9 ? `0${date.getDate() + 1}` : `${date.getDate() + 1}`
  }T${date.getHours() < 9 ? `0${date.getHours()}` : `${date.getHours()}`}:${
    date.getMinutes() < 9 ? `0${date.getMinutes()}` : `${date.getMinutes()}`
  }:00`;

// FIXME: CHAOS-66, user authentication and redirection if they are not logged in or authenticated
const CreateCampaign = () => {
  const [tab, setTab] = useState(0);
  const [campaignName, setCampaignName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [interviewStage, setInterviewStage] = useState(false);
  const [scoringStage, setScoringStage] = useState(false);
  const [cover, setCover] = useState(null);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [roleSelected, setRoleSelected] = useState(
    roles.length > 0 ? roles[0].id : "-1"
  );
  const [questions, setQuestions] = useState([]);
  const campaignData = {
    tab,
    setTab,
    campaignName,
    setCampaignName,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    description,
    setDescription,
    interviewStage,
    setInterviewStage,
    scoringStage,
    setScoringStage,
    cover,
    setCover,
    error,
    setError,
    roles,
    setRoles,
    roleSelected,
    setRoleSelected,
    questions,
    setQuestions,
  };

  const onTabChange = (val) => {
    // only allow user to access review/publish tab if all inputs are non-empty
    if (val === 2) {
      if (
        campaignName === "" ||
        description === "" ||
        cover === null ||
        questions.length === 0 ||
        roles.length === 0
      ) {
        alert("All fields must be filled before reviewing!");
        return;
      }
    }
    setTab(val);
  };

  // FIXME: USEEFFECT TO INIT ORG_ID ON PAGE LOAD, REDIRECT AS PART
  //        OF AUTH THINGY
  const { state } = useLocation();
  const { orgID } = state;
  // FIXME: CHAOS-64, update submitHandler to account for new data
  //        (roles/questions etc.), part of backend integration
  const submitHandler = async (isDraft) => {
    if (campaignName.length === 0 && !isDraft) {
      setError("Campaign name is required");
    } else if (description === 0 && !isDraft) {
      setError("Campaign description is required");
    } else if (startDate.getTime() > endDate.getTime()) {
      setError("Start date must be before end date");
    } else if (roles.length === 0 && !isDraft) {
      setError("At least one role is required");
    } else if (questions.length === 0 && !isDraft) {
      setError("At least one question is required");
    } else {
      setError(null);
    }

    const coverSend = cover ? cover.slice(cover.indexOf(";base64,") + 8) : "";
    const startTimeString = dateToString(startDate);
    const endTimeString = dateToString(endDate);

    // FIXME: change to correct route once it exists
    const postCampaign = await fetch("http://127.0.0.1:8000/campaign/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // TODO: replace organisation id with something in the frontend that returns the id, would necessitate an endpoint to get all orgs the  user is a part of
        organisation: {
          organisation_id: orgID,
          campaignName,
          description,
          starts_at: startTimeString,
          ends_at: endTimeString,
          isDraft,
          cover_image: coverSend,
        },
        roles: roles.map((r) => ({ title: r.title, quantity: r.quantity })),
        questions: questions.map((q) => ({
          text: q.text,
          roles: [...q.roles],
        })),
      }),
    });

    const status = await postCampaign.status;
    if (status === 200) {
      console.log("nice!");
    } else {
      console.log("something fucked up");
    }
  };
  return (
    <Container>
      <Tabs
        value={tab}
        onChange={(e, val) => onTabChange(val)}
        centered
        style={{ paddingBottom: "30px", paddingTop: "15px" }}
      >
        <Tab label="campaign" />
        <Tab label="roles" />
        <Tab label="review" />
      </Tabs>
      <CampaignTab isSelected={tab === 0} campaignData={campaignData} />
      <RolesTab isSelected={tab === 1} campaignData={campaignData} />
      <ReviewTab
        isSelected={tab === 2}
        campaign={campaignData}
        onSubmit={submitHandler}
      />
      {(tab === 0 || tab === 1) && (
        <NextWrapper>
          <NextButton
            variant="contained"
            onClick={() => {
              onTabChange(tab + 1);
            }}
          >
            Next
            <ArrowIcon />
          </NextButton>
        </NextWrapper>
      )}
    </Container>
  );
};

export default CreateCampaign;
