/**
 * Created by Sandeep on 01/06/14.
 */

var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var categoriesSchema=new Schema({
    title: 'String',
    parentId: 'String'
   
});

module.exports=mongoose.model('Category',categoriesSchema);

