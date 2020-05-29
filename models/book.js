const mongoose=require('mongoose');
const Schema=mongoose.Schema;

let bookSchema= new Schema({
    title: {type:String, required:true},
    author: {type:Schema.Types.ObjectId, ref:"Author", required:true},
    summary: {type:String, required:true},
    isbn: {type:String, required:true},
    genre: [{type:Schema.Types.ObjectId, ref:"Genre"}]
});

//Virtual for book's URL
bookSchema
.virtual('url')
.get(function(){
    return 'book/' +this._id;
});

//Export Model
module.exports=mongoose.model('Book',bookSchema);