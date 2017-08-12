var TextEditor, PreviewView;
TextEditor = require('atom').TextEditor;
PreviewView = (function(superclass){
  var prototype = extend$((import$(PreviewView, superclass).displayName = 'PreviewView', PreviewView), superclass).prototype, constructor = PreviewView;
  module.exports = PreviewView;
  function PreviewView(arg$){
    this.uri = arg$.uri;
    PreviewView.superclass.call(this);
  }
  PreviewView.prototype.getURI = function(){
    return this.uri;
  };
  PreviewView.prototype.isModified = function(){
    return false;
  };
  PreviewView.prototype.getTitle = function(){
    return 'Source Preview';
  };
  PreviewView.prototype.getTabText = function(){
    return 'Source Preview';
  };
  return PreviewView;
}(TextEditor));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
//# sourceMappingURL=/home/bartek/Projekty/atom/atom-livescript-ide-preview/lib/PreviewView.js.map
