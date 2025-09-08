import { useState } from "react";
import { TextField, Button, Grid, Typography, Paper } from "@mui/material";
import axios from "axios";

export default function ShortenPage() {
  const [inputs, setInputs] = useState([{ url: "", validity: 30, shortcode: "" }]);
  const [results, setResults] = useState([]);

  const handleChange = (i, field, value) => {
    const updated = [...inputs];
    updated[i][field] = value;
    setInputs(updated);
  };

  const addRow = () => {
    if (inputs.length < 5) setInputs([...inputs, { url: "", validity: 30, shortcode: "" }]);
  };

  const handleSubmit = async () => {
    const resList = [];
    for (let input of inputs) {
      try {
        const res = await axios.post("http://localhost:4000/shorturls", input);
        resList.push(res.data);
      } catch (err) {
        resList.push({ error: err.response?.data?.error || "Failed" });
      }
    }
    setResults(resList);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Shorten URLs</Typography>
      {inputs.map((inp, i) => (
        <Grid container spacing={2} key={i} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Original URL" value={inp.url}
              onChange={(e) => handleChange(i, "url", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Validity (min)" type="number" value={inp.validity}
              onChange={(e) => handleChange(i, "validity", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Custom Shortcode" value={inp.shortcode}
              onChange={(e) => handleChange(i, "shortcode", e.target.value)} />
          </Grid>
        </Grid>
      ))}
      <Button onClick={addRow} disabled={inputs.length >= 5}>Add another</Button>
      <Button variant="contained" sx={{ ml: 2 }} onClick={handleSubmit}>Shorten</Button>

      {results.length > 0 && (
        <div style={{ marginTop: "1em" }}>
          {results.map((r, idx) =>
            r.shortLink ? (
              <Typography key={idx}>
                ✔️ {r.shortLink} (expires {new Date(r.expiry).toLocaleString()})
              </Typography>
            ) : (
              <Typography color="error" key={idx}>❌ {r.error}</Typography>
            )
          )}
        </div>
      )}
    </Paper>
  );
}
