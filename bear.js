// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BearSchema   = new Schema({
    name: String,
    type: String,
    period: Number,
    quantity: Number
},
{versionKey: false}     //disables '__v' version property
);

module.exports = mongoose.model('Bear', BearSchema);