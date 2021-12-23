import {
  Button,
  Container,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
import { enAU } from "date-fns/locale";
import Image from "material-ui-image";
import React from "react";
import { DesktopDatePicker, LocalizationProvider } from "@mui/lab";
import DateFnsUtils from "@date-io/date-fns";

/**
 * Needs ability to
 * add open roles           own component
 * banner                   image
 * start and end dates      two date types
 * name of campaign         text
 * flavour text             text
 * Common questions         text
 * Role specific questions  text
 * Interview stage?         boolean
 * Scoring stage?           boolean
 *
 * above are requirements
 * autosave every x amount of minutes counter
 * below are optional
 *
 * success and failure email templates
 */

const CampaignCreatePage = () => {
  const [name, setName] = React.useState("");
  // const [banner, setBanner] = React.useState(null);
  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(new Date());
  const [flavourText, setFlavourText] = React.useState("");
  const [interviewStage, setInterviewStage] = React.useState(false);
  const [scoringStage, setScoringStage] = React.useState(false);

  return (
    <Container>
      <Image src="https://source.unsplash.com/random" />
      <TextField
        label="Campaign Name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="Campaign Description"
        variant="outlined"
        value={flavourText}
        onChange={(e) => setFlavourText(e.target.value)}
      />
      <LocalizationProvider locale={enAU} dateAdapter={DateFnsUtils}>
        <DesktopDatePicker
          label="Campaign Start Date"
          inputFormat="dd/MM/yyyy"
          // eslint-disable-next-line react/jsx-props-no-spreading
          renderInput={(params) => <TextField {...params} />}
          value={startDate}
          onChange={(date) => setStartDate(date)}
        />
      </LocalizationProvider>
      <LocalizationProvider dateAdapter={DateFnsUtils}>
        <DesktopDatePicker
          label="Campaign End Date"
          inputFormat="dd/MM/yyyy"
          // eslint-disable-next-line react/jsx-props-no-spreading
          renderInput={(params) => <TextField {...params} />}
          value={endDate}
          onChange={(date) => setEndDate(date)}
        />
      </LocalizationProvider>
      <FormControlLabel
        control={
          <Switch
            label="Interview Stage"
            onChange={() => setInterviewStage(!interviewStage)}
            checked={interviewStage}
          />
        }
        label="Interview Stage"
      />
      <FormControlLabel
        control={
          <Switch
            label="Scoring Stage"
            onChange={() => setScoringStage(!scoringStage)}
            checked={scoringStage}
          />
        }
        label="Scoring Stage"
      />
      <Button variant="contained" color="primary">
        Submit
      </Button>
    </Container>
  );
};

export default CampaignCreatePage;
