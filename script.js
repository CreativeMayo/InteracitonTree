import * as d3 from 'https://d3js.org/d3.v7.min.js';
import axios from 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';

// The rest of your code...

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data structure to store the tree
let treeData = {};

// POST route to handle the data sent from Postman
app.post('/answers', (req, res) => {
  const { answers } = req.body;

  // Iterate through each answer in the received data
  answers.forEach(answer => {
    const { question, response } = parseAnswer(answer);

    // Traverse the tree and add/update nodes based on the question and response
    traverseTree(treeData, question, response);
  });

  res.status(200).json({ message: 'Data received and processed successfully.' });
});

// Function to parse the answer in the format: '@username text'
function parseAnswer(answer) {
  const [username, response] = answer.split(' ');
  const question = username.substring(1);

  return { question, response };
}

// Function to traverse the tree and add/update nodes
function traverseTree(node, question, response) {
  if (node.question === question) {
    // If the question already exists, add the response to its answers array
    node.answers.push(response);
  } else {
    // If the question doesn't exist, create a new child node and traverse further
    let found = false;

    for (let i = 0; i < node.children.length; i++) {
      if (traverseTree(node.children[i], question, response)) {
        found = true;
        break;
      }
    }

    if (!found) {
      const newNode = {
        question,
        answers: [response],
        children: []
      };

      node.children.push(newNode);
    }
  }

  return node.question === question;
}

// Set up the 3D.js tree layout
const treeLayout = d3.tree().size([width, height]);

// Create an SVG element and append it to the tree container
const svg = d3.select('#tree-container').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Function to fetch the data and render the tree visualization
function fetchDataAndRenderTree() {
  axios.get('/tree-data') // Replace with the actual endpoint to fetch the tree data
    .then(response => {
      const data = response.data;

      // Generate the tree layout
      const root = d3.hierarchy(data);
      const tree = treeLayout(root);

      // Create links
      const links = svg.selectAll('.link')
        .data(tree.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkVertical()
          .x(d => d.x)
          .y(d => d.y));

      // Create nodes
      const nodes = svg.selectAll('.node')
        .data(tree.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x},${d.y})`);

      // Append circles to nodes
      nodes.append('circle')
        .attr('r', 5);

      // Append text labels to nodes
      nodes.append('text')
        .attr('dy', 5)
        .attr('x', d => d.children ? -10 : 10)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.question);

      // Function to render the links
      function renderLinks() {
        links.attr('d', d3.linkVertical()
          .x(d => d.x)
          .y(d => d.y));
      }

      // Function to render the nodes
      function renderNodes() {
        nodes.attr('transform', d => `translate(${d.x},${d.y})`);
      }

      // Function to update the tree visualization
      function updateTree() {
        renderLinks();
        renderNodes();
      }

      // Call the updateTree function initially to render the tree
      updateTree();
    })
    .catch(error => {
      console.error('Error fetching tree data:', error);
    });
}

// Call the function to fetch the data and render the tree visualization
fetchDataAndRenderTree();

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
