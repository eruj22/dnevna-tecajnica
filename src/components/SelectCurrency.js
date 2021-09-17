import React from "react"
import { allCurrencies } from "../utils/functions"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import FormControl from "@mui/material/FormControl"

function SelectCurrency({ changeCurrency, setChangeCurrency }) {
  const handleChange = (e) => {
    setChangeCurrency(e.target.value)
  }

  return (
    <FormControl variant="standard" className="select">
      <InputLabel>Valuta</InputLabel>
      <Select value={changeCurrency} onChange={handleChange} labelId="demo">
        {allCurrencies.map((item) => {
          const { id, currency } = item
          return (
            <MenuItem key={currency} value={id}>
              {currency}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

export default SelectCurrency
