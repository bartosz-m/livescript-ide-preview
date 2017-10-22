require! {
    \path
    \atom : { TextEditor, CompositeDisposable }
    \source-map : { SourceMapConsumer }
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
        @last-top = @origin.element.get-scroll-top!
        @subscriptions
            ..add @origin.on-did-stop-changing @~render
            ..add @origin.on-did-change-cursor-position @~sync-cursor-position
            ..add @origin.element.on-did-change-scroll-top @~sync-scroll

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
            @source-map = new SourceMapConsumer source-map if source-map
            @set-text code
        catch
            @set-text e.message

    scroll-to-line: (line) ->

    sync-scroll: (top) !->
        delta =
            if top < @last-top
            then 0
            else @origin.element.get-height!
        @last-top = top
        screen-position = @origin.screen-position-for-pixel-position top:top + delta, left: 0
        buffer-position = @origin.buffer-position-for-screen-position screen-position
        preview-line = @get-preview-line-position buffer-position
        @scroll-to-buffer-position [preview-line, 0]


    sync-cursor-position: ->
        return unless @origin?

        buffer-position = it.new-buffer-position#, @origin.get-cursor-buffer-position!
        buffer-row = buffer-position.row
        previewRow = @get-preview-line-position buffer-position
        return unless previewRow?
        @set-cursor-buffer-position [previewRow, 0], autoscroll: true
        @clear-selections!
        @select-lines-containing-cursors!
        @origin.element?focus!

    get-preview-line-position: (position) ->
        return unless @source-map?
        { line } = transpiled-position = @source-map.generated-position-for do
            source: @source-map.sources.0
            line: position.row + 1
            column: position.column + 1
        line - 1
