global.Promise = require('bluebird');

require('dotenv').config();
const db = require('../db');
const mongoose = require('mongoose'); 
const Review = mongoose.model('Review');
db.init([]);

async function run() {
  let reviews = await Review.find({}).populate('program');
  for( let i=0 ; i < reviews.length ; ++i ) {
    reviews[i].title = `${reviews[i].program.name} ${reviews[i].startDate.getFullYear()}`;
    await reviews[i].save();
  }
  await mongoose.disconnect();
}

run();
