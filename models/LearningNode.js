var keystone = require('keystone');
var Types = keystone.Field.Types;

var LearningNode = new keystone.List('LearningNode', {
	autokey: { path: 'slug', from: 'name', unique: true },
	sortable: true
});

LearningNode.add({
	name: { type: String, required: true, index: true },
	description: { type: Types.Textarea, height: 150 },
	learningPath: { type: Types.Relationship, ref: 'LearningPath', index: true, initial: true },
	node: { type: Types.Relationship, ref: "LearningNode", index: true, initial: true, label: "Parent node"},
	json: {type: String, readonly: true }
});


LearningNode.defaultColumns = 'sortOrder|10%, name, description, node';

// Excute after save
LearningNode.schema.post('save', function(item) {
	LearningNode.model.find({ learningPath: item.learningPath })
	.exec()
	.then(function(items) {
		var arr = [];
	  	while( items.length > 0 ){
	  		if( !items[0].node ){
	  			var obj = { name : items[0].name };
		  		obj.nodes = recursion(items[0], items);
				arr.push(obj);
	  		}
	  		items.splice(0, 1);
		};

		// Save tree node to lastest record
		LearningNode.model.update(
		  	{ learningPath : item.learningPath },
		  	{ $set : { 'json' : JSON.stringify(arr) } },
		  	{ 'multi' : true }
		).exec(function(err,result){
			console.log(result);
		});

	}, function(err) {
	  	console.log(err);
	});
});

LearningNode.register();

function recursion(item, items){
	var arr = [];
	for (var i = 0; i < items.length; i++) {

		if( items[i]._id != item._id && JSON.stringify(items[i].node) === JSON.stringify(item._id) ) {
			var obj = { name : items[i].name };
			obj.nodes = recursion(items[i], items);
			arr.push(obj);
		}

  	}
  	return arr;
}