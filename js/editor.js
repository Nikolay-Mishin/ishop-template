// CK Editor
const editor_class = '.editor',
	editor_id = '#editor',
	$editors = $(editor_class);

if(notEmpty($editors)){
	for(var i = 0; i < $editors.length; i++){
		editorInstance($($editors[i]), $editors.length, i);
	}
	for(var editor in getEditors()){
		editorOnChange(editor);
	}
}

function editorInstance(editor, length = null, i = null){
	//console.log({ editorInstance: editor, length: length, i: i });
	var length = length != null ? length : $(editor_class).filter(editor_id).length;
	if(length > 1) editorChangeId(editor, i != null ? i + 1 : length);
	//console.log({ length: length });
	editor.ckeditor();
}

function editorChangeId(editor, i){
	editor.prop('id', editor.prop('id') + '_' + i);
}

function getEditors(){
	return CKEDITOR.instances;
}

function getEditor(id){
	return getEditors()[typeof id == 'object' ? id.prop('id') : id];
}

function editorOnChange(editor, callback = function(){}){
	var editor = getEditor(editor),
		value;
	if(!editor) return false;
	editor.on('change', function(){
		this.updateElement();
		callback(this._.data, $(this.element.$), this);
	});
	return value;
}
