const mongooose=require('mongoose');
const Schemma=mongooose.Schema;
const moment=require('moment');

let bookInstanceSchema=new Schemma({
    book: {type:Schemma.Types.ObjectId, ref:"Book", required: true},
    imprint: {type:String,required:true},
    status: {type:String, required:true, enum:['Available','Maintenance','Loaned','Reserved'], default: 'Maintenance'},
    dueBack:{type:Date, default: Date.now()}
});

//Virtual for bookinstance's URL
bookInstanceSchema
.virtual('url')
.get(function(){
    return 'bookinstance/'+this._id;
});

bookInstanceSchema
.virtual('due_back_formatted')
.get(function(){
    return moment(this.dueBack).format('MM/DD/YYYY');
});

//Export Model
module.exports=mongooose.model('BookInstance', bookInstanceSchema);
