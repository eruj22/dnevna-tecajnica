import React, { useEffect, useState } from "react"
import * as d3 from "d3"
import SelectYear from "./components/SelectYear"
import SelectCurrency from "./components/SelectCurrency"
import "./style.css"
import { dateRange } from "./utils/functions"
import { allCurrencies, allYears } from "./utils/functions"

function App() {
  const [changeYear, setChangeYear] = useState("0")
  const [changeCurrency, setChangeCurrency] = useState("0")

  const margin = { top: 40, right: 0, bottom: 30, left: 60 },
    width = 860 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom

  const svg = d3
    .select("#graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  // Add legend
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "20px")
    .style("text-anchor", "middle")
    .text(allCurrencies[changeCurrency].currency)

  svg
    .append("text")
    .attr("y", height + 20)
    .attr("x", width / 2)
    .attr("dy", "20px")
    .style("text-anchor", "middle")
    .text(allYears[changeYear].year)

  const url = "https://bsi.si/_data/tecajnice/dtecbs-l.xml"

  useEffect(() => {
    fetch(url)
      .then((resp) => {
        return resp.text()
      })
      .then((data) => {
        let parser = new DOMParser(),
          xmlDoc = parser.parseFromString(data, "text/xml")
        const parsedData = parseData(xmlDoc)
        drawChart(parsedData)
      })
      .catch((error) => console.log(error))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeYear, changeCurrency])

  const parseDate = d3.timeParse("%Y-%m-%d"),
    formatDate = d3.timeFormat("%b %d")

  function parseData(data) {
    data = data.getElementsByTagName("tecajnica")
    let usableData = []
    for (let i in data) {
      if (typeof data[i] === "object") {
        usableData.push({
          date: parseDate(data[i].attributes.datum.textContent),
          price: data[i].childNodes[parseInt(changeCurrency)].textContent,
        })
      }
    }
    return usableData
  }

  function drawChart(data) {
    let filteredData = data.filter(
      (d) =>
        d.date >= dateRange[parseInt(changeYear)].startDate &&
        d.date <= dateRange[parseInt(changeYear)].endDate
    )

    // Add X axis
    const x = d3
      .scaleTime()
      .domain(
        d3.extent(filteredData, function (d) {
          return d.date
        })
      )
      .range([0, width])

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([
        0.4,
        d3.max(filteredData, function (d) {
          return +d.price
        }),
      ])
      .range([height, 0])
    svg.append("g").call(d3.axisLeft(y))

    // Add the line
    svg
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.date)
          })
          .y(function (d) {
            return y(d.price)
          })
      )

    // Add focus
    const focus = svg
      .append("g")
      .attr("class", "focus")
      .style("display", "none")

    focus
      .append("line")
      .attr("class", "x")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5)
      .attr("y1", 0)
      .attr("y2", height)

    focus
      .append("line")
      .attr("class", "y")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5)
      .attr("x1", width)
      .attr("x2", width)

    focus.append("circle").attr("class", "y").style("fill", "none").attr("r", 4)

    focus.append("text").attr("class", "y1").attr("dx", 8).attr("dy", "-.3em")
    focus.append("text").attr("class", "y2").attr("dx", 8).attr("dy", "-.3em")

    focus.append("text").attr("class", "y3").attr("dx", 8).attr("dy", "1em")
    focus.append("text").attr("class", "y4").attr("dx", 8).attr("dy", "1em")

    const mouseMove = (event) => {
      const bisect = d3.bisector((d) => d.date).left,
        x0 = x.invert(d3.pointer(event, this)[0]),
        i = bisect(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0

      focus
        .select("circle.y")
        .attr("transform", `translate(${x(d.date)}, ${y(d.price)})`)

      focus
        .select("text.y1")
        .attr("transform", `translate(${x(d.date)}, ${y(d.price)})`)
        .text(d.price)

      focus
        .select("text.y2")
        .attr("transform", `translate(${x(d.date)}, ${y(d.price)})`)
        .text(d.price)

      focus
        .select("text.y3")
        .attr("transform", `translate(${x(d.date)}, ${y(d.price)})`)
        .text(formatDate(d.date))

      focus
        .select("text.y4")
        .attr("transform", `translate(${x(d.date)}, ${y(d.price)})`)
        .text(formatDate(d.date))

      focus
        .select(".x")
        .attr("transform", `translate(${x(d.date)}, ${y(d.price)})`)
        .attr("y2", height - y(d.price))

      focus
        .select(".y")
        .attr("transform", `translate(${width * -1}, ${y(d.price)})`)
        .attr("x2", width + width)
    }

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => {
        focus.style("display", null)
      })
      .on("mouseout", () => {
        focus.style("display", "none")
      })
      .on("touchmove mousemove", mouseMove)
  }

  return (
    <header className="header">
      <h1 className="header__title">{`Prikaz gibanja ${allCurrencies[changeCurrency].currency} proti EUR v letu ${allYears[changeYear].year}`}</h1>
      <div className="header__select">
        <SelectYear changeYear={changeYear} setChangeYear={setChangeYear} />
        <SelectCurrency
          changeCurrency={changeCurrency}
          setChangeCurrency={setChangeCurrency}
        />
      </div>
    </header>
  )
}

export default App
