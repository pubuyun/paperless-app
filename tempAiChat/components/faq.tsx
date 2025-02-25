import Typography from "@mui/material/Typography"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Box from "@mui/material/Box"


// todo, make this in

export function FAQ() {
  return (
    <Box sx={{ maxWidth: "48rem", mx: "auto", my: 2 }}>
      <Typography variant="h4" gutterBottom>
        Frequently Asked Questions
      </Typography>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
          <Typography>What is this chatbot?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            This is an AI-powered chatbot that can answer questions and assist with various tasks.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
          <Typography>How does it work?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>The chatbot uses advanced language models to understand and respond to your queries.</Typography>
        </AccordionDetails>
      </Accordion>
      {/* add more faq as needed */}
    </Box>
  )
}

