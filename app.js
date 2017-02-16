import express from 'express';
import graphqlHTTP from 'express-graphql';
import {buildSchema} from 'graphql';
import chalk from 'chalk';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';

import schema from './schema';

require('dotenv').config();

const app = express();

app.set('port', process.env.PORT || 3000);

// make bluebird default Promise
Promise = require('bluebird');

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

mongoose.connect(process.env.MONGODB, {
    server: {
        socketOptions: {
            keepAlive: 1
        }
    }
});

mongoose.connection.on('error', function() {
    console.log('MongoDB Connection Error.');
    process.exit(1);
});

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(compress());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// use GraphQL
app.use('/graphql', graphqlHTTP(req => ({
    schema,
    graphiql: true,
    rootValue: {
        request: req
    },
    pretty: true
})))

app.get('/', (req, res) => {
    res.sendStatus(200);
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
    return next(res.status(404).json({msg: 'NOT FOUND'}));
});

app.listen(app.get('port'), () => {
    console.log(`${chalk.green('✓')} Server is running at http://localhost:${app.get('port')}`);
});

export default app;
