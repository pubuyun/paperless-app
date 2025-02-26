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
    label: "GPT-4o-mini",
  },
  {
    value: "o3-mini",
    label: "o3-mini",
  },
  {
    value: "o3-mini",
    label: "o3-mini",
  },
  {
    value: "deepseek-chat",
    label: "Deepseek V3",
  },
  {
    value: "claude-3-5-sonnet-20241022",
    label: "Claude Sonnet 3.5",
  },
  {
    value: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
  },
  {
    value: "qwen2.5-32b-instruct",
    label: "Qwen 2.5 (32b)",
  },
  {
    value: "Doubao-pro-128k",
    label: "Doubao Pro (128k)",
  },
  {
    value: " llama3.3-70b-instruct",
    label: "Llama 3.3 (70b)",
  },
]

// "gpt-4o", # openais flagship model, expensive
// "gpt-4o-mini", # like 4o but faster, cheap and efficient can offer for free
// "o3-mini", # cheaper than 4o, a small fast, super smart reasoning model
// "deepseek-reasoner", # industtry breaking cheap and effective reasoning model
// "deepseek-chat", # deepseek's direct prediction model
// "claude-3-5-sonnet-20241022", # smart model for complex problems
// "gemini-2.0-flash", # google's flagship fast model
// "qwen2.5-32b-instruct", # opensource model from china, alibaba
// "Doubao-pro-128k", # erm what the
// "llama3.3-70b-instruct", # industry-leading speed in open source model

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
      {models.map((model) => (
        <MenuItem key={model.value} value={model.value}>
          {model.label}
        </MenuItem>
      ))}
    </Select>
  );
};