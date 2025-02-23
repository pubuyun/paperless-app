"use client"

import React from "react"
import Box from "@mui/material/Box"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { type SelectChangeEvent } from "@mui/material/Select"

const models = [
  {
    value: "gpt-4",
    label: "GPT-4",
  },
  {
    value: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
  },
]

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = React.useState(models[0].value)

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedModel(event.target.value as string)
  }

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="model-select-label">Model</InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={selectedModel}
          label="Model"
          onChange={handleChange}
        >
          {models.map((model) => (
            <MenuItem key={model.value} value={model.value}>
              {model.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

