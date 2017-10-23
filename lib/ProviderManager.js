var Disposable;
Disposable = require('atom').Disposable;
module.exports = {
  providers: [],
  registerProvider: function(provider){
    var disposable, this$ = this;
    if (provider != null && !this.isProviderRegistered(provider)) {
      this.providers.push(provider);
      return disposable = new Disposable(function(){
        return this$.removeProvider(provider);
      });
    }
  },
  removeProvider: function(provider){
    return this.providers.splice(this.providers.indexOf(provider, 1));
  },
  isProviderRegistered: function(provider){
    return in$(provider, this.providers);
  },
  providerForGrammar: function(arg$){
    var name, scopeName, i$, ref$, len$, provider;
    name = arg$.name, scopeName = arg$.scopeName;
    for (i$ = 0, len$ = (ref$ = this.providers).length; i$ < len$; ++i$) {
      provider = ref$[i$];
      if (provider.fromGrammarName === name) {
        return provider;
      }
    }
    for (i$ = 0, len$ = (ref$ = this.providers).length; i$ < len$; ++i$) {
      provider = ref$[i$];
      if (provider.fromScopeName === scopeName) {
        return provider;
      }
    }
    return null;
  },
  providerForExtension: function(extension){
    var grammars;
    if (extension[0] === '.') {
      extension = extension.substring(1);
    }
    grammars = atom.grammars.getGrammars().filter(function(it){
      return in$(extension, it.fileTypes);
    });
    if (grammars.length > 0) {
      return this.providerForGrammar(grammars[0]);
    } else {
      return null;
    }
  }
};
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}
//# sourceMappingURL=ProviderManager.js.map
