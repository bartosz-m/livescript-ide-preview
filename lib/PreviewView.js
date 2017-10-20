var path, ref$, TextEditor, CompositeDisposable, instances, PreviewView;
path = require('path');
ref$ = require('atom'), TextEditor = ref$.TextEditor, CompositeDisposable = ref$.CompositeDisposable;
instances = new WeakSet;
module.exports = PreviewView = {
  name: 'PreviewView',
  isInstance: bind$(instances, 'has'),
  create: async function(arg){
    var outputPath, item, x$;
    outputPath = arg.path.replace(/\.ls$/, '.js');
    item = (await atom.workspace.createItemForURI(outputPath));
    x$ = import$(item, this);
    x$.init(arg);
    instances.add(x$);
    return x$;
  },
  init: function(arg$){
    var extension, pane, sourceGrammar, ProviderManager;
    this.protocol = arg$.protocol, this.path = arg$.path, this.provider = arg$.provider, this.origin = arg$.origin;
    this.subscriptions = new CompositeDisposable;
    extension = path.extname(this.path);
    pane = atom.workspace.paneForURI(this.path);
    this.origin == null && (this.origin = pane.itemForURI(this.path));
    if (this.provider == null) {
      sourceGrammar = atom.grammars.selectGrammar(this.path, "");
      ProviderManager == null && (ProviderManager = require('./ProviderManager'));
      this.provider = ProviderManager.providerForGrammar(sourceGrammar);
    }
    this.grammar = atom.grammars.grammarForScopeName(this.provider.toScopeName);
    if (this.grammar) {
      this.setGrammar(this.grammar);
    }
    this.setPlaceholderText("Source Preview");
    this.render();
    this.subscriptions.add(this.origin.onDidStopChanging(bind$(this, 'render')));
  },
  destroy: function(){
    var ref$;
    if ((ref$ = this.subscriptions) != null) {
      ref$.dispose();
    }
    return TextEditor.prototype.destroy.call(this);
  },
  getURI: function(){
    return this.protocol + "://" + this.path;
  },
  isModified: function(){
    return false;
  },
  getTitle: function(){
    return 'Source Preview';
  },
  serialize: function(){},
  render: async function(){
    var options, ref$, code, sourceMap, e;
    options = {
      sourceMap: true,
      filePath: this.origin.getPath()
    };
    try {
      ref$ = (await this.provider.transform(this.origin.getText(), options)), code = ref$.code, sourceMap = ref$.sourceMap;
      return this.setText(code);
    } catch (e$) {
      e = e$;
      return console.log('error', e);
    }
  }
};
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
//# sourceMappingURL=/home/bartek/Projekty/atom/atom-livescript-ide-preview/lib/PreviewView.js.map
