const express = require('express');
const expressUpload = require('express-fileupload');
const expressWs = require('express-ws');
const cors = require('cors');

const { customExceptionHandler } = require('./handler');
const route = require('./route');
const { uploadPath } = require('./upload');

const port = process.env.PORT || 3000;

const app = express();
expressWs(app);

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(expressUpload());

app.use('/upload', express.static(uploadPath));
app.use('/api', route);

app.use(customExceptionHandler);

app.listen(port, () => console.log(`server is running on port ${port}`));
