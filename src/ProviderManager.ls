require! {
    \atom : { Disposable }
}

module.exports =
    providers:  []

    register-provider: (provider) ->
        if provider? and not @is-provider-registered provider
            @providers.push provider
            disposable = new Disposable ~> @remove-provider provider

    remove-provider: (provider) ->
        @providers.splice @providers.index-of provider, 1

    is-provider-registered: (provider) -> provider in @providers

    provider-for-grammar: ({name, scope-name}) ->
        for provider in @providers
            return provider if provider.from-grammar-name is name

        for provider in @providers
            return provider if provider.from-scope-name is scope-name
        null

    provider-for-extension: (extension) ->
        if extension.0 == '.'
            extension = extension.substring 1
        grammars = atom.grammars.get-grammars!filter ->
            extension in it.file-types
        if grammars.length > 0
            @provider-for-grammar grammars.0
        else
            null
