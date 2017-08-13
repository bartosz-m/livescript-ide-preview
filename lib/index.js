var Path, ref$, CompositeDisposable, TextBuffer, PreviewView, config, ProviderManager, split$ = ''.split;
Path = require('path');
ref$ = require('atom'), CompositeDisposable = ref$.CompositeDisposable, TextBuffer = ref$.TextBuffer;
PreviewView = require('./PreviewView');
config = require('./config');
module.exports = {
  config: config,
  subscriptions: null,
  protocol: 'livescript-ide',
  activate: function(state){
    var x$;
    x$ = this.subscriptions = new CompositeDisposable;
    x$.add(atom.commands.add('atom-workspace', {
      'livescript-ide-preview:toggle': bind$(this, 'toggle')
    }));
    return atom.workspace.addOpener(bind$(this, 'openUri'));
  },
  openUri: function(uri, options){
    var ref$, protocol, path, e;
    ref$ = split$.call(uri, '://'), protocol = ref$[0], path = ref$[1];
    if (protocol !== this.protocol) {
      return;
    }
    try {
      path = decodeURI(path);
    } catch (e$) {
      e = e$;
      return;
    }
    return PreviewView.create({
      protocol: protocol,
      path: path
    });
  },
  deactivate: function(){
    var ref$;
    if ((ref$ = this.subscriptions) != null) {
      ref$.dispose();
    }
    return this.subscriptions = null;
  },
  toggle: async function(){
    var activePane, editor, uri, previewPane, editorGrammar, provider, options, previewView;
    activePane = atom.workspace.getActivePane();
    editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    if (PreviewView.isInstance(editor)) {
      activePane.destroyItem(editor);
      return;
    }
    uri = this.protocol + '://' + editor.getURI();
    previewPane = atom.workspace.paneForURI(uri);
    if (previewPane != null) {
      previewPane.destroyItem(previewPane.itemForURI(uri));
    } else {
      editorGrammar = editor.getGrammar();
      provider = this.getProviderManager().providerForGrammar(editorGrammar);
      if (provider) {
        options = {
          searchAllPanes: true,
          split: 'right',
          provider: provider,
          origin: editor
        };
        previewView = (await atom.workspace.open(uri, options));
        activePane.activate();
      } else {
        atom.notifications.addError('Missing provider', {
          dismissable: true,
          detail: "there is no provider for " + editorGrammar.name
        });
      }
    }
  },
  getProviderManager: function(){
    var ProviderManager;
    return ProviderManager != null
      ? ProviderManager
      : ProviderManager = require('./ProviderManager');
  },
  consumeProvider: function(provider){
    return this.getProviderManager().registerProvider(provider);
  }
};
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
//# sourceMappingURL=/home/bartek/Projekty/atom/atom-livescript-ide-preview/lib/index.js.map
