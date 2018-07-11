var path, ref$, TextEditor, CompositeDisposable, SourceMapConsumer, instances, PreviewView;
path = require('path');
ref$ = require('atom'), TextEditor = ref$.TextEditor, CompositeDisposable = ref$.CompositeDisposable;
SourceMapConsumer = require('source-map').SourceMapConsumer;
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
    var extension, pane, sourceGrammar, ProviderManager, x$, this$ = this;
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
    this.lastTop = this.origin.element.getScrollTop();
    this.config = {
      enableSyncScroll: atom.config.get('livescript-ide-preview.enableSyncScroll'),
      enableSyncCursor: atom.config.get('livescript-ide-preview.enableSyncCursor')
    };
    x$ = this.subscriptions;
    x$.add(atom.config.observe('livescript-ide-preview.enableSyncScroll', function(v){
      return this$.config.enableSyncScroll = v;
    }));
    x$.add(atom.config.observe('livescript-ide-preview.enableSyncCursor', function(v){
      return this$.config.enableSyncCursor = v;
    }));
    x$.add(this.origin.onDidStopChanging(bind$(this, 'refresh')));
    x$.add(this.origin.onDidChangeCursorPosition(bind$(this, 'syncCursorPosition')));
    x$.add(this.origin.element.onDidChangeScrollTop(bind$(this, 'syncScroll')));
    this.refresh();
  },
  refresh: async function(){
    (await this.render());
    return this.syncCursorPosition({
      newBufferPosition: this.origin.getCursorBufferPosition()
    });
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
    var options, ref$, code, sourceMap, e, text;
    options = {
      sourceMap: true,
      filePath: this.origin.getPath()
    };
    try {
      ref$ = (await this.provider.transform({
        uri: "file://" + this.path,
        code: this.origin.getText(),
        options: options
      })), code = ref$.code, sourceMap = ref$.sourceMap;
      if (sourceMap) {
        this.sourceMap = new SourceMapConsumer(sourceMap);
      }
      this.setText(code);
    } catch (e$) {
      e = e$;
      text = e.message + "\n" + e.stack;
      this.setText(text);
    }
    return this.syncCursorPosition({
      newBufferPosition: this.origin.getCursorBufferPosition()
    });
  },
  scrollToLine: function(line){},
  syncScroll: function(top){
    var delta, screenPosition, bufferPosition, previewLine;
    if (!this.config.enableSyncScroll) {
      return;
    }
    delta = top < this.lastTop
      ? 0
      : this.origin.element.getHeight();
    this.lastTop = top;
    screenPosition = this.origin.element.screenPositionForPixelPosition({
      top: top + delta,
      left: 0
    });
    bufferPosition = this.origin.bufferPositionForScreenPosition(screenPosition);
    previewLine = this.getPreviewLinePosition(bufferPosition);
    this.scrollToBufferPosition([previewLine, 0]);
  },
  syncCursorPosition: function(it){
    var bufferPosition, bufferRow, previewRow, ref$;
    if (!this.config) {
      console.log(this);
    }
    if (!this.config.enableSyncCursor) {
      return;
    }
    if (this.origin == null) {
      return;
    }
    bufferPosition = it.newBufferPosition;
    bufferRow = bufferPosition.row;
    previewRow = this.getPreviewLinePosition(bufferPosition);
    if (previewRow == null) {
      return;
    }
    this.setCursorBufferPosition([previewRow, 0], {
      autoscroll: true
    });
    this.clearSelections();
    this.selectLinesContainingCursors();
    return (ref$ = this.origin.element) != null ? ref$.focus() : void 8;
  },
  getPreviewLinePosition: function(position){
    var transpiledPosition, line;
    if (this.sourceMap == null) {
      return;
    }
    line = (transpiledPosition = this.sourceMap.generatedPositionFor({
      source: this.sourceMap.sources[0],
      line: position.row + 1,
      column: position.column + 1
    })).line;
    return line - 1;
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
//# sourceMappingURL=PreviewView.js.map
