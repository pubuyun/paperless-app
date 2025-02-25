"use client"

import React from "react"
import Box from "@mui/material/Box"
import InputLabel from "@mui/material/InputLabel"
import FormControl from "@mui/material/FormControl"
import { Select, MenuItem, SelectChangeEvent } from "@mui/material";

const models = [
  {
    value: "deepseek-reasoner",
    label: "Deepseek R1",
  },
  {
    value: "gpt-4o",
    label: "GPT-4o",
  },
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
  },
]

interface ModelSelectorProps {
  onChange: (model: string) => void;
  value: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ onChange, value }) => {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      sx={{ minWidth: 200 }}
    >
      <MenuItem value="gpt-4o">GPT-4o</MenuItem>
      <MenuItem value="gpt-4o-mini">GPT-4o mini</MenuItem>
      <MenuItem value="deepseek-reasoner">Deepseek R1</MenuItem>
    </Select>
  );
};

//todo from the list