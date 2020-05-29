const Genre = require('../models/genre');
const async=require('async');
const Book = require('../models/book');
const validator=require('express-validator');
const {body,validationResult,sanitizeBody}=require('express-validator');

// Display list of all Genre.
exports.genre_list = function(req, res) {
    Genre.find()
    .populate('genre')
    .sort([['name','ascending']])
    .exec(function(err,list_genre){
        if(err){return next(err);}
        res.render('genre_list',{title:'Genre List',genre_list:list_genre});
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {

    async.parallel({
        genre: function(callback) {

            Genre.findById(req.params.id)
              .exec(callback);
        },

        genre_books: function(callback) {
          Book.find({ 'genre': req.params.id })
          .exec(callback);
        },

    }, function(err, results) {
        console.log(err);
        // Successful, so render.
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
    });

};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', {title:'Add New Genre'});
};

// Handle Genre create on POST.
exports.genre_create_post = [
    //Validation: Check if the name is not empty
    //tirm() ensures that whitespace don't get accepted as input
    // We can also validate that the field is not empty on the client side by adding the value required='true' to the field definition in the form
    validator.body('name','Genre name required').trim().isLength({min:1}),

    //Sanitize (escape) the name field.
    validator.sanitizeBody('name').escape(),

    //Process request after validation and sanitization
    (req,res,nex)=>{

        //Extracting the validation errors from a request
        const errors=validator.validationResult(req);

        //Creating a new genre object with escaped and trimmed data
        let genre=new Genre(
            {name:req.body.name}
        );

        if(!errors.isEmpty()){
            //There are errors. Render the form with sanitized values/error messages
            res.render('genre_form',{title: 'Add New Genre',genre:genre,errors:errors.array()});
            return;
        }else{
            //Data from the form is valid
            //Check if Genre with the same name already exists
            Genre.findOne({'name':req.body.name})
                .exec(function(err,found_genre){
                    if(err){return next(err);}

                    if(found_genre){
                        //Genre exists, redirect to its detail page
                        res.redirect(found_genre.url);
                    }else{
                        genre.save(function(err){
                            if (err){return next(err);}
                            //Genre saved. Redirect to genre detail page.
                            res.redirect('/catalog/genres');
                        });
                    }
                });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res,next) {
    async.parallel({
        genre:function(callback){
            Genre.findById(req.params.id).exec(callback)
        },
        genre_books:function(callback){
            Book.find({'genre':req.params.id}).exec(callback)
        }
    },function(err,results){
        if(err){return next(err);}
        if(results.genre==null){
            res.redirect('/catalog/genres');
        }
        //Successful, so render
        res.render('genre_delete',{title:'Delete Genre',genre:results.genre,genre_books:results.genre_books});
    });
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res,next) {
    async.parallel({
        genre:function(callback){
            Genre.findById(req.body.genreid).exec(callback)
        },
        genre_books:function(callback){
            Book.find({'genre':req.body.genreid}).exec(callback)
        }
    },function(err,results){
        if(err){return next(err);}
        if(results.genre_books.length>0){
            //Genre has books. Render in same way as for GET route.
            res.render('genre_delete',{title:'Delete Genre',genre:results.genre,genre_books:results.genre_books});
            return;
        }else{
            //Genre has no books. Delete object and redirect to the list of books.
            Genre.findByIdAndRemove(req.body.genreid,function deleteGenre(err){
                if(err){return next(err);}
                //Success - go to author list
                res.redirect('/catalog/genres');
            });
        }
    });
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res,next) {
    let genre=function (callback){
        let result=Genre.findById(req.params.id);
        if(!result){
            let err=new Error('Cannot find Genre');
            err.status=404;
            return callback(err);
        }
        callback(result);
    }
    function render(genre){
        res.render('genre_form',{title:'Update Genre',genre:genre});
    }
    genre(render);
};

// Handle Genre update on POST.
exports.genre_update_post = [
    //Validate fields
    body('name','Genre name must not be empty.').trim().isLength({min:1}),

    //Sanitize fields
    sanitizeBody('name').escape(),

    //Process request after validation and sanitization.
    (req,res,next)=>{
        //Extract the validation errors from a request.
        const errors=validationResult(req);

        //Create a Genre object with escaped/trimmed data and old id.
        const genre=new Genre({
            name:req.body.name,
            _id:req.params.id
        });

        if(!errors.isEmpty()){
            //There are errors. Render form again with sanitized values/errors messages.
            res.render('genre_form',{title:'Update Genre',genre:genre,errors:errors.array()});
        }else{
            //Data from form is valid. Update the record.
            Genre.findByIdAndUpdate(req.params.id,genre,{},function(err,thegenre){
                if(err){return next(err);}
                //Successful - redirecr to genre detail page
                res.redirect('/catalog/'+thegenre.url);
            });
        }
    }
];

