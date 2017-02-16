import {getSchema} from '@risingstack/graffiti-mongoose';
import AccessToken from './models/AccessToken';
import Client from './models/Client';
import Company from './models/Company';
import Enquiry from './models/Enquiry';

const options = {
    mutation: true, // mutation fields can be disabled
    allowMongoIDMutation: false // mutation of mongo _id can be enabled
};

const schema = getSchema([AccessToken, Client, Company, Enquiry], options);

export default schema;
