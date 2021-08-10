var mongoose = require('mongoose');
var articleModel = require('./models/article');

const init = async (url) => {
    await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
    console.log(`Connected to database on ${url}!`);
}

const getArticleData = async (id) => {
    
}

module.exports = {init, getArticleData};