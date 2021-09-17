import React from "react"
import { allYears } from "../utils/functions"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import FormControl from "@mui/material/FormControl"

function SelectYear({ changeYear, setChangeYear }) {
  const handleChange = (e) => {
    setChangeYear(e.target.value)
  }

  return (
    <FormControl variant="standard" className="select">
      <InputLabel>Leto</InputLabel>
      <Select value={changeYear} onChange={handleChange}>
        {allYears.map((item) => {
          const { id, year } = item
          return (
            <MenuItem key={id} value={id}>
              {year}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

export default SelectYear
