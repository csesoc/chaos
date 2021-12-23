import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
} from "@mui/material";

const CampaignCard = (props) => {
  const { title, startDate, endDate, img } = props;
  // const { title, description, startDate, endDate, img } = props;

  return (
    <Card sx={{ maxWidth: 275 }}>
      <CardMedia
        component="img"
        height="140"
        image={img}
        alt={`campaign cover for ${title}`}
      />
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {`${startDate} - ${endDate}`}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Apply</Button>
      </CardActions>
    </Card>
  );
};

CampaignCard.propTypes = {
  title: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  // description: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
};

export default CampaignCard;
