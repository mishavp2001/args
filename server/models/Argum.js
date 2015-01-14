/**
 * Created by Sandeep on 01/06/14.
 */

var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var argumSchema=new Schema({
    title: 'String',
    details: 'String',
    publishDate: 'String',
    vote: 'String',
    user: 'String',
    public: 'String',
    solutions: [
	    {	id: String,
	    	title: 'String',
	    	details: 'String',
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
