const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/answers', (req, res) => {
  const { answers } = req.body;

  // Process the received data and store it in an appropriate data structure
  // Modify the code below based on your specific requirements

  answers.forEach(answer => {
    // Parse each answer and store it in your data structure
    // For example:
    console.log(answer);
  });

  res.status(200).json({ message: 'Data received and processed successfully.' });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
