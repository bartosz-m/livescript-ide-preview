require! {
    \atom : { TextEditor }
}

class PreviewView extends TextEditor
    module.exports = @

    ({@uri}) !->
        super!

    getURI: -> @uri

    is-modified: -> false

    get-title: -> 'Source Preview'
    get-tab-text: -> 'Source Preview'
