//Importing Schema class of mongoose package/module
const mongoose=require('mongoose');
const Schema=mongoose.Schema;

//Defining the schema for Genre by creating an instance of the Schema
let genreSchema=new Schema({
    name: {type:String, required:true, minlength:3, maxlength:100},
});

//Virtual for Genre's URL
genreSchema
.virtual('url')
.get(function(){
    return 'genre/'+this._id;
});

//Creating Genre model based on the above schema and then Exporting the model 
module.exports=mongoose.model('Genre',genreSchema);