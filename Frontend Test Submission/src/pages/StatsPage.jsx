import { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Paper, List, ListItem, ListItemText } from "@mui/material";

export default function StatsPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/shorturls").then(res => {
      setData(res.data);
    }).catch(err => {
      console.error("Failed to load stats", err);
    });
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Short URL Statistics</Typography>
      <List>
        {data.map((item) => (
          <ListItem key={item.shortcode} alignItems="flex-start">
            <ListItemText
              primary={`${item.shortLink}  (clicks: ${item.clicks})`}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    Original: {item.url}
                  </Typography><br/>
                  Created: {new Date(item.createdAt).toLocaleString()}<br/>
                  Expires: {new Date(item.expiresAt).toLocaleString()}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
