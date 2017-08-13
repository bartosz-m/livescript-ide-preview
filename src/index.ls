require! {
    \path : Path
    \atom : { CompositeDisposable, TextBuffer }
    \./PreviewView
    \./config
}

var ProviderManager

module.exports =
    config: config
    subscriptions: null
    protocol: \livescript-ide

    activate: (state) ->
        @subscriptions = new CompositeDisposable
            ..add atom.commands.add 'atom-workspace', 'livescript-ide-preview:toggle': @~toggle
        atom.workspace.add-opener @~open-uri

    open-uri: (uri, options) ->
        [protocol, path] = uri / '://'
        return if protocol != @protocol
        try
            path = decode-URI path
        catch
            return
        PreviewView.create {protocol,path}

    deactivate: ->
        @subscriptions?dispose!
        @subscriptions = null

    toggle: !->>
        active-pane = atom.workspace.get-active-pane!
        editor = atom.workspace.get-active-text-editor!
        return unless editor?

        if PreviewView.is-instance editor
            active-pane.destroy-item editor
            return

        uri = @protocol + '://' + editor.get-URI!

        preview-pane = atom.workspace.pane-for-URI uri
        if preview-pane?
            preview-pane.destroy-item preview-pane.item-for-URI uri
        else
            editor-grammar = editor.get-grammar!
            provider = @get-provider-manager!provider-for-grammar editor-grammar
            if provider
                options =
                    search-all-panes: true
                    split: \right
                    provider: provider
                    origin: editor

                preview-view = await atom.workspace.open uri, options
                active-pane.activate!
            else
                atom.notifications.add-error 'Missing provider',
                    dismissable: true
                    detail: "there is no provider for #{editor-grammar.name}"


    get-provider-manager: -> ProviderManager ?= require \./ProviderManager

    consume-provider: (provider) ->
        @get-provider-manager!register-provider provider
