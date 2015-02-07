/**
 * Created by Sandeep on 01/06/14.
 */

var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var argumSchema=new Schema({
    title: 'String',
    details: 'String',
    criterias: [{id: String, title: String, range: String, weight: Number}],
    publishDate: 'String',
    vote: Number,
    agree: Number,
    agreeusers: [{'user': String, 'comment': String}],
    disagree: Number,
    disagreeusers: [{'user': String, 'comment': String}],
    user: 'String',
    category: 'String',
    share: 'Boolean',
    date: 'Date',
    solutions: [
	    {	id: String,
      	title: 'String',
	    	details: 'String',
        urls:[{url: 'String'}],
        agree: Number,
        disagree: Number,
        criterias: [{value: String, rating: Number, wrating: Number}],
        score: 'Number',
	    	pros:[{id: String, title: String, details: String, rating: Number}],
	    	cons:[{id: String, title: String, details: String, rating: Number}]
	    }	
    ]
});

module.exports=mongoose.model('Argum',argumSchema);

/*

Example:

    {
      "title":"New ARGUM",  
      "publishDate": "01/01/2001",
      "details": "Detailsjehhehrje",
      "vote": "10",
      "solutions": [{
        			"id": "423523", 
        			"title": "Solution1 title ",
        			"details": "Solution1 details ehgrygeyrye ererterteyrtye",
      				"cons": [{"id": "1", "title": "takes too long", "details": "tyy", "rating": 11},
                            {"id": "2", "title": "takes too long", "details": "tyy", "rating": 1}
                            ],
                    "pros": [
                          {"id": "1", "title": "get knowledge", "details": "er", "rating": 5},
                          {"id": "2", "title": "get new knowledge", "details": "er", "rating": 5}
                    ]
      }]
    }
*/
