require! {
    \atom : { Disposable }
}

module.exports =
    providers:  []

    updated-config: ->
        schema =
            type: \object
            properties: {}
        for provider in @providers
            provider-schema = schema.properties{}[provider.from-grammar-name]
                ..type = \string
                ..default = provider.name
                ..[]\enum .push do
                    value: provider.name
                    description: "#{provider.name} : #{provider.description}"
        schema

    register-provider: (provider) ->
        if provider? and not @is-provider-registered provider
            @providers.push provider

            atom.config.set-schema \atom-livescript-ide-preview.provider, @updated-config!
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
