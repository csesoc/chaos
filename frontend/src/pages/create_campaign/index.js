import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Tabs, Tab } from "@mui/material";
import CampaignTab from "./Campaign";
import RolesTab from "./Roles";
import ReviewTab from "./Preview";
import { NextButton, ArrowIcon, NextWrapper } from "./createCampaign.styled";
import { postCampaign } from "../../api";

const dateToString = (date) =>
  `${date.getFullYear()}-${
    date.getMonth() < 9 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`
  }-${date.getDate() < 9 ? `0${date.getDate() + 1}` : `${date.getDate() + 1}`
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
  const [answers, setAnswers] = useState([]);
  const campaign = {
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
    answers,
    setAnswers,
  };
  const campaignTabIdx = 0;
  const rolesTabIdx = 1;
  const reviewTabIdx = 2;

  const onTabChange = (newTab) => {
    // only allow user to access review tab if all inputs are non-empty
    if (newTab === reviewTabIdx) {
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
    setTab(newTab);
  };

  // FIXME: CHAOS-66, need to use auth token + orgID so check if
  //        user has admin permissions in the organisation
  const { state } = useLocation();
  const { orgID } = state;

  const submitHandler = async (isDraft) => {
    if (campaignName.length === 0 && !isDraft) {
      setError("Campaign name is required");
    } else if (description === 0 && !isDraft) {
      setError("Campaign description is required");
    } else if (cover === null) {
      setError("Cover image is required");
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
    const campaignSend = {
      organisation_id: orgID,
      campaign_name: campaignName,
      cover_image: coverSend,
      description,
      starts_at: startTimeString,
      ends_at: endTimeString,
      is_draft: isDraft,
    };
    const rolesSend = roles.map((r) => ({
      title: r.title,
      quantity: r.quantity,
    }));
    const questionsSend = questions.map((q) => ({
      text: q.text,
      roles: [...q.roles],
    }));

    const post = await postCampaign(campaignSend, rolesSend, questionsSend);

    const status = await post.status;
    if (status === 200) {
      console.log("nice!");
    } else {
      console.log("something went wrong");
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
      {tab === campaignTabIdx && <CampaignTab campaign={campaign} />}
      {tab === rolesTabIdx && <RolesTab campaign={campaign} />}
      {tab === reviewTabIdx && (
        <ReviewTab campaign={campaign} onSubmit={submitHandler} />
      )}
      {(tab === campaignTabIdx || tab === rolesTabIdx) && (
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
