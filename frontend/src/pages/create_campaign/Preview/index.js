import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Grid } from "@mui/material";
import { SubmitButton, SubmitWrapper } from "./reviewTab.styled";
import ApplicationForm from "../../../components/ApplicationForm";
import CampaignCard from "../../../components/CampaignCard";

// FIXME: CHAOS-65, add campaign card to preview tab
const ReviewTab = ({ isSelected, campaign, onSubmit }) => {
  const {
    questions,
    roles,
    campaignName,
    cover,
    description,
    startDate,
    endDate,
  } = campaign;
  const [rolesSelected, setRolesSelected] = useState([]);
  const [answers, setAnswers] = useState({});
  useEffect(() => {
    const newAnswers = questions.map((q) => {
      const tmp = {};
      if (!(q.id in answers)) {
        tmp[q.id] = "";
      } else {
        tmp[q.id] = answers[q.id];
      }
      return tmp;
    });
    questions.forEach((q) => {
      if (!(q.id in answers)) {
        newAnswers[q.id] = "";
      }
    });
    setAnswers(newAnswers);
    console.log(answers);
  }, [questions]);

  const dummyUserInfo = {
    name: "First Last",
    zid: "z1234567",
    email: "firstlast@gmail.com",
    degree: "Bachelor of Science (Computer Science)",
  };
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    isSelected && (
      <>
        <div style={{display: "flex", backgroundColor:"#e2e6ed", padding:"3%", flexDirection: "column"}}>
          <text style={{textAlign:"center", padding:"5px"}}>
            Please Review both the application card and form before publishing. This is
            how your campaign will appear to applicants.
          </text>
          <text style={{textAlign:"center", padding: "5px"}}>
            Click "apply" to view the application form.
          </text>
        </div>
        <Grid container spacing={2} columns={4} style={{paddingTop:"30px"}}>
          <Grid item xs={1.5}></Grid>
          <Grid item key={campaignName} xs={1}>
            <CampaignCard
              title={campaignName}
              appliedFor={[]}
              positions={roles.map((r) => ({ number: r.quantity, name: r.title }))}
              startDate={`${startDate.getDate()} ${months[startDate.getMonth()]} ${startDate.getFullYear()}`}
              endDate={`${endDate.getDate()} ${months[endDate.getMonth()]} ${endDate.getFullYear()}`}
              img={cover}
            />
          </Grid>
        </Grid>
        <ApplicationForm
          questions={questions}
          roles={roles}
          rolesSelected={rolesSelected}
          setRolesSelected={setRolesSelected}
          answers={answers}
          setAnswers={setAnswers}
          campaignName={campaignName}
          headerImage={cover}
          description={description}
          userInfo={dummyUserInfo}
        />
        <SubmitWrapper>
          <SubmitButton onClick={() => onSubmit(true)} variant="outlined">
            Create Draft
          </SubmitButton>
          <SubmitButton onClick={() => onSubmit(false)} variant="contained">
            Publish
          </SubmitButton>
        </SubmitWrapper>
      </>
    )
  );
};

ReviewTab.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  campaign: PropTypes.shape({
    questions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        roles: PropTypes.objectOf(PropTypes.string).isRequired,
      })
    ).isRequired,
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
      })
    ).isRequired,
    campaignName: PropTypes.string.isRequired,
    cover: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ReviewTab;
