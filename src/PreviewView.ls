require! {
    \path
    \atom : { TextEditor, CompositeDisposable }
}

instances = new WeakSet

module.exports = PreviewView =
    name: \PreviewView

    is-instance: instances~has

    create: (arg) ->>
        output-path = arg.path.replace /\.ls$/ '.js'
        item = await atom.workspace.create-item-for-URI output-path
        item <<< @
            ..init arg
            instances.add ..

    init: ({@protocol,@path, @provider, @origin}) !->
        @subscriptions = new CompositeDisposable
        extension = path.extname @path
        pane = atom.workspace.pane-for-URI @path
        @origin ?= pane.item-for-URI @path
        unless @provider?
            source-grammar = atom.grammars.select-grammar @path, ""
            ProviderManager ?= require \./ProviderManager
            @provider = ProviderManager.provider-for-grammar source-grammar

        @grammar = atom.grammars.grammar-for-scope-name @provider.to-scope-name

        @set-grammar @grammar if @grammar
        @set-placeholder-text "Source Preview"
        @render!
        @subscriptions.add @origin.on-did-stop-changing @~render

    destroy: ->
        @subscriptions?.dispose!
        TextEditor::destroy.call @

    getURI: -> "#{@protocol}://#{@path}"

    is-modified: -> false

    get-title: -> 'Source Preview'

    serialize: ->

    render: ->>
        options =
            source-map: true
            filePath: @origin.get-path!
        try
            {code, source-map} = await @provider.transform @origin.get-text!, options
            @set-text code
        catch
            console.log \error e
