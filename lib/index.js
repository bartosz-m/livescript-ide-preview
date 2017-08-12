var CompositeDisposable, split$ = ''.split;
CompositeDisposable = require('atom').CompositeDisposable;
module.exports = {
  subscriptions: null,
  protocol: 'livescript-ide',
  activate: function(state){
    this.subscriptions = new CompositeDisposable;
    atom.commands.add('atom-workspace', {
      'livescript-ide-preview:toggle': bind$(this, 'toggle')
    });
    return atom.workspace.addOpener(bind$(this, 'openUri'));
  },
  openUri: function(uri){
    var ref$, protocol, path, e, PreviewView;
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
    PreviewView == null && (PreviewView = require('./PreviewView'));
    return new PreviewView({
      uri: uri
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
    var PreviewView, activePane, editor, uri, previewPane, options, previewView;
    PreviewView == null && (PreviewView = require('./PreviewView'));
    activePane = atom.workspace.getActivePane();
    editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    if (editor instanceof PreviewView) {
      activePane.destroyItem(editor);
      return;
    }
    uri = this.protocol + '://' + 'preview/editor/' + editor.id;
    previewPane = atom.workspace.paneForURI(uri);
    if (previewPane != null) {
      previewPane.destroyItem(previewPane.itemForURI(uri));
    } else {
      options = {
        searchAllPanes: true,
        split: 'right'
      };
      previewView = (await atom.workspace.open(uri, options));
      activePane.activate();
    }
  }
};
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
//# sourceMappingURL=/home/bartek/Projekty/atom/atom-livescript-ide-preview/lib/index.js.map
