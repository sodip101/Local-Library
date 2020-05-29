let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let moment=require('moment');

let authorSchema=new Schema({
    firstName:{type:String,required:true,max:100},
    familyName:{type:String,required:true,max:100},
    dateOfBirth:{type:Date},
    dateOfDeath:{type:Date},
});
authorSchema.set('toObject',{virtuals:true});
authorSchema.set('toJSON',{virtuals:true});
// Virtual for author's full name
authorSchema
.virtual('name')
.get(function(){

// To avoid errors in cases where an author does not have either a family name or first name
// We want to make sure we handle the exception by returning an empty string for that case

  let fullname = '';
  if (this.firstName && this.familyName) {
    fullname = this.familyName + ', ' + this.firstName
  }
  if (!this.firstName || !this.familyName) {
    fullname = '';
  }  
  return fullname;
});

//Virtual for author's lifespan
authorSchema
.virtual('lifespan')
.get(function(){
    if(this.dateOfBirth && this.dateOfDeath){
      return ('('+moment(this.dateOfBirth).format('YYYY').toString()+' - '+moment(this.dateOfDeath).format('YYYY').toString()+')');
    }else if(this.dateOfBirth){
      return ('('+moment(this.dateOfBirth).format('YYYY').toString()+' - Present)');
    }
});

//Virtual for author's URL
authorSchema
.virtual('url')
.get(function(){
    return 'author/'+this._id;
});

//Export Model
module.exports=mongoose.model('Author', authorSchema);
