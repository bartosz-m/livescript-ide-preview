require! {
    \atom : { CompositeDisposable }
}

module.exports =
    subscriptions: null
    protocol: \livescript-ide

    activate: (state) ->
        @subscriptions = new CompositeDisposable
        atom.commands.add 'atom-workspace', 'livescript-ide-preview:toggle': @~toggle
        atom.workspace.add-opener @~open-uri

    open-uri: (uri) ->
        [protocol, path] = uri / '://'
        return if protocol != @protocol
        try
            path = decodeURI(path)
        catch
            return
        PreviewView ?= require \./PreviewView
        new PreviewView {uri}

    deactivate: ->
        @subscriptions?dispose!
        @subscriptions = null

    toggle: !->>
        PreviewView ?= require \./PreviewView
        active-pane = atom.workspace.get-active-pane!
        editor = atom.workspace.get-active-text-editor!
        return unless editor?

        if editor instanceof PreviewView
            active-pane.destroy-item editor
            return

        uri = @protocol + '://' + 'preview/editor/' + editor.id

        preview-pane = atom.workspace.pane-for-URI uri
        if preview-pane?
            preview-pane.destroy-item preview-pane.item-for-URI uri
        else
            options =
                search-all-panes: true
                split: \right
            preview-view = await atom.workspace.open uri, options
            active-pane.activate!
