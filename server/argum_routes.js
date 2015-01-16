/**
 * Created by Michael on 01/06/14.
 */

var Argum=require('./models/Argum');
var express=require('express');

//configure routes

var router=express.Router();



router.route('/argums')
    .get(function(req,res){
       Argum.find(function(err,argums){
           if(err)
                res.send(err);
           res.json(argums);
       });
    })

    .post(function(req,res){
         console.log('New argum' + req.body)

        var argums=new Argum(req.body);
        argums.save(function(err){
            if(err)
                res.send(err);
            res.json({argums:'Argum Added'});
        });
    });

router.route('/argums/:id')
    .put(function(req,res){
        Argum.findOne({_id:req.params.id},function(err,argums){

            if(err)
                res.send(err);

           for(prop in req.body){
                argums[prop]=req.body[prop];
           }

            // save the argums
            argums.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Argum updated!' });
            });

        });
    })

    .get(function(req,res){
        Argum.findOne({_id:req.params.id},function(err, argums) {
            if(err)
                res.send(err);

            res.send(argums);
        });
    })

    .delete(function(req,res){
        console.log('Delete...');
        Argum.remove({
            _id: req.params.id
        }, function(err, argums) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

module.exports=router;
