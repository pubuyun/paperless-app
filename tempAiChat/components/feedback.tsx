"use client"

import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"

export function Feedback() {
  const [feedback, setFeedback] = React.useState("")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // handle feedback subsmission, not complete
    console.log("Feedback submitted:", feedback)
    setFeedback("")
  }

  return (
    <Box sx={{ maxWidth: "48rem", mx: "auto", my: 2 }}>
      <Typography variant="h4" gutterBottom>
        Provide Feedback
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Your feedback here..."
          variant="outlined"
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Submit Feedback
        </Button>
      </form>
    </Box>
  )
}

