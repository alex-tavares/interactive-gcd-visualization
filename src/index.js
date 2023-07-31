// Import the required libraries and CSS file
import * as d3 from "d3";
import "./styles.css";

// Define the color palette for the squares
const colors = [
  "#FF69B4",
  "#FF8C00",
  "#00BFFF",
  "#20B2AA",
  "#8FBC8F",
  "#E6E6FA",
  "#FFF0F5",
  "#BDB76B",
];

// Define the size of the SVG container and padding
const CONTAINER_SIZE = 600;
const CONTAINER_PADDING = 30;

// Create the SVG container and append it to the DOM
const svgContainer = d3
  .select("#visualization")
  .append("svg")
  .attr("width", CONTAINER_SIZE + CONTAINER_PADDING)
  .attr("height", CONTAINER_SIZE + CONTAINER_PADDING);

// Get the sliders container and legends container elements
const slidersContainer = document.getElementById("sliders");
const legendsContainer = d3.select("#legends").append("svg");

// Function to hide the loading element
function hideLoadingElement() {
  document.getElementById("loading").style.display = "none";
}

// Function to update the displayed values of sliders
function updateSlidersValues(a, b) {
  document.getElementById("aValue").textContent = a;
  document.getElementById("bValue").textContent = b;
}

function updateGcd(value) {
  document.getElementById("gcd").textContent = value;
}

// Function to create or update square elements on the SVG container
function createSquareElements(data) {
  const squares = svgContainer
    .selectAll(".rectangle") // Select existing rectangles with class 'rectangle'
    .data(data); // Bind data to the selection

  // For new data points, append rectangles
  squares
    .enter()
    .append("rect")
    .merge(squares) // Merge the new elements with the existing ones
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .attr("width", (d) => d.side)
    .attr("height", (d) => d.side)
    .style("fill", (d) => d.color)
    .classed("rectangle", true);

  squares.exit().remove(); // Remove any extra rectangles
}

// Function to create axis labels for 'numA' and 'numB'
function createAxisLabels(numA, numB) {
  svgContainer.selectAll(".axis-label").remove();

  const scale = CONTAINER_SIZE / Math.max(numA, numB);

  // Add "a" label to the top
  svgContainer
    .append("text")
    .attr("x", (numA * scale) / 2 + CONTAINER_PADDING)
    .attr("y", 15)
    .text(numA)
    .classed("axis-label", true)
    .attr("text-anchor", "middle");

  // Add "b" label to the left
  svgContainer
    .append("text")
    .attr("x", 10)
    .attr("y", (numB * scale) / 2 + CONTAINER_PADDING + 5)
    .text(numB)
    .classed("axis-label", true)
    .attr("text-anchor", "middle");
}

// Function to create or update legends on the legends container
function createLegends(data) {
  const legendItemSize = 24;
  const legendSpacing = 8;

  const legendGroup = legendsContainer
    .attr("height", data.length * (legendItemSize + legendSpacing))
    .selectAll(".legendItem")
    .data(data);

  // Enter selection for the legend group
  const legendEnter = legendGroup
    .enter()
    .append("g")
    .attr("class", "legendItem");

  // Append rectangles to the legend group
  legendEnter
    .append("rect")
    .attr("width", legendItemSize)
    .attr("height", legendItemSize)
    .style("fill", (d) => d.color)
    .attr(
      "transform",
      (d, i) => `translate(0, ${i * (legendItemSize + legendSpacing)})`
    );

  // Append text elements to the legend group
  legendEnter
    .append("text")
    .attr("x", legendItemSize + 5)
    .attr("y", (d, i) => i * (legendItemSize + legendSpacing) + 12)
    .text((d) => d.text);

  // Merge the new elements with the existing ones
  const mergedLegends = legendEnter.merge(legendGroup);

  // Update attributes for both rectangles and text elements
  mergedLegends
    .select("rect")
    .attr("width", legendItemSize)
    .attr("height", legendItemSize)
    .style("fill", (d) => d.color)
    .attr(
      "transform",
      (d, i) => `translate(0, ${i * (legendItemSize + legendSpacing)})`
    );

  mergedLegends
    .select("text")
    .attr("x", legendItemSize + 12)
    .attr("y", (d, i) => i * (legendItemSize + legendSpacing) + 16)
    .text((d) => d.text)
    .style("fill", (d) => d.color);

  legendGroup.exit().remove(); // Remove any extra legend groups
}

// Function to generate chart data and legends data based on 'numA' and 'numB'
function generateChartData(numA, numB) {
  const chartData = [];
  const legendsData = [];

  const scale = Math.floor(CONTAINER_SIZE / Math.max(numA, numB));

  let currentA = numA;
  let currentB = numB;

  let x = 0 + CONTAINER_PADDING;
  let y = 0 + CONTAINER_PADDING;
  let colorIndex = 0;

  while (currentB !== 0) {
    if (currentA >= currentB) {
      const squaresNumber = Math.floor(currentA / currentB);

      for (let i = 0; i < squaresNumber; i++) {
        const dataEntry = {
          x,
          y,
          side: currentB * scale,
          color: colors[colorIndex],
        };

        chartData.push(dataEntry);

        if (x + currentB * scale < numA * scale + CONTAINER_PADDING) {
          x += currentB * scale;
        } else {
          y += currentB * scale;
        }
      }

      const legendEntry = {
        color: colors[colorIndex],
        text: `${currentA} = ${squaresNumber} x ${currentB} + ${
          currentA % currentB
        }`,
      };

      legendsData.push(legendEntry);

      colorIndex++;
    }

    const temp = currentB;
    currentB = currentA % currentB;
    currentA = temp;
  }

  return [chartData, legendsData, currentA];
}

// Function to update the screen based on slider input
function updateScreen(numA, numB) {
  const [data, legends, gcd] = generateChartData(numA, numB);

  createAxisLabels(numA, numB);
  createSquareElements(data);
  createLegends(legends);

  updateSlidersValues(numA, numB);
  updateGcd(gcd);

  hideLoadingElement();
}

// Function to handle the input change event for sliders
function handleInputChange() {
  const [numA, numB] = [
    parseInt(aSlider.value, 10),
    parseInt(bSlider.value, 10),
  ];
  updateScreen(numA, numB);
}

// Set up the sliders with initial values
slidersContainer.innerHTML = `
  <br>
  <div>The GCD is <span id="gcd">1</span></div>
  <br>
  <label for="aSlider">a = <span id="aValue">31</span></label>
  <input type="range" id="aSlider" min="1" max="50" step="1" value="31" />
  <br>
  <label for="bSlider">b = <span id="bValue">19</span></label>
  <input type="range" id="bSlider" min="1" max="50" step="1" value="19" />
`;

const [aSlider, bSlider] = [
  document.getElementById("aSlider"),
  document.getElementById("bSlider"),
];

// Add event listeners to the sliders
function addEventListeners() {
  aSlider.addEventListener("input", handleInputChange);
  bSlider.addEventListener("input", handleInputChange);
}

// Remove event listeners when the window is closed
function removeEventListeners() {
  aSlider.removeEventListener("input", handleInputChange);
  bSlider.removeEventListener("input", handleInputChange);
}

window.addEventListener("beforeunload", () => {
  removeEventListeners();
});

// Initialize the visualization with default values
addEventListeners();
updateScreen(parseInt(aSlider.value, 10), parseInt(bSlider.value, 10));
