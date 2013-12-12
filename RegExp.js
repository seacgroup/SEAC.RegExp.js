/* 
 * The MIT Modified License (MIT, Erich Horn)
 * Copyright (c) 2012, 2013 Erich
 *
 * Author Erich
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to 
 * deal in the Software without restriction, including without limitation the 
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
 * sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice, author and this permission notice shall be 
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
 * IN THE SOFTWARE.
 */

/* Extended RegExp support */

( function ( SEAC ) {
    var _NativeStringProto = String.prototype,
        _NativeMatch = _NativeStringProto.match,
        _NativeReplace = _NativeStringProto.Replace,
        _NativeRegExpProto = RegExp.prototype,
        _NativeExec = _NativeRegExpProto.exec,
        _NativeTest = _NativeRegExpProto.test,
        _ConvertToNativeRE = /(\()(?:(?!\?)|\?P?<([a-zA-Z]\w*)>)|\[:([a-z]+):\]|\\./g,
        _ConvertToNativeClassList = {
            alnum:  "[a-zA-Z0-9]",      //Alphanumeric characters
            alpha:  "[a-zA-Z]",         //Alphabetic characters
            ascii:  "[\x00-\x7F]",      //ASCII characters
            blank:  "[ \t]",            //Space and tab
            cntrl:  "[\x00-\x1F\x7F]",  //Control characters
            digit:  "\d",               //Digits
            graph:  "[\x21-\x7E]",      //Visible characters (i.e. anything except spaces, control characters, etc.)
            lower:  "[a-z]",            //Lowercase letters
            print:  "[\x20-\x7E]",      //Visible characters and spaces (i.e. anything except control characters, etc.)
            punct:  "[!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]", //Punctuation and symbols.
            space:  "\s",               //All whitespace characters, including line breaks
            upper:  "[A-Z]",            //Uppercase letters
            word:   "\w",               //Word characters (letters, numbers and underscores)
            xdigit: "[A-Fa-f0-9]"       //Hexadecimal digits
        },
        _ConvertToNative = function ( regexpString, groups ) {
            var native = [],
                groupIndex = 0,
                p = 0,
                m, i, t, v;
            
            groups || ( groups = {} ),
            _ConvertToNativeRE.lastIndex = 0;
            while ( m = _ConvertToNativeRE.exec( regexpString ) ) {
                console.log( m );
                if ( p < ( i = m.index ) )
                    native.push( regexpString.slice( p, i ) );
                if ( ( t = m[1] ) ) {
                    groupIndex++;
                    if ( m[2] )
                        groups[m[2]] = groupIndex;
                    native.push( '(' )
                } else if ( ( t = m[3] ) ) {
                    if ( ( v = _ConvertToNativeClassList[t] ))
                        native.push( v );
                    else
                        throw 'unrecognized Character class: ' + t;
                } else {
                    native.push( m[0] );
                }
                p = _ConvertToNativeRE.lastIndex;
            }
            if ( p < regexpString.length )
                native.push( regexpString.slice( p ) );
            
            return native.join( '' );
        },
        _AttachNamedGroups = function ( obj, groups ) {
            var g = {},
                k, i, v;
            
            if ( obj == null )
                return obj;
            
            for ( k in groups )
                if ( ( v = obj[groups[k]] ) != null )
                    g[k] = v;
            
            obj.named = g;
            
            return obj;
        },
        _Escape = function ( str, escape ) {
            if ( escape instanceof RegExp ) {
                escape = new RegExp( escape.source, 'g' );
            } else if ( typeof ( escape || ( escape = '\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|' ) ) === 'string' ) {
                escape = new RegExp( '[\\' + escape.split( '' ).join( '\\' ) + ']', 'g' );
            } else
                throw 'invalid escape characters (second argument)';
            
            return str.replace( escape, "\\$&" );
        };
    
    SEAC.RegExp = function ( source, flags ) {
        var groups = { },
            regexp = RegExp.call( this, _ConvertToNative( source, groups ), flags );
        
        Object.defineProperties( this, {
            "source":   { get: function ( ) { return source } },
            "valueOf":  { value: function ( ) { return regexp.valueOf( ) } },
            "native":   { get: function ( ) { return regexp } },
            "groups":   { get: function ( ) { return Object.keys( groups ); } },
            "exec":     { value: function ( ) { return _AttachNamedGroups( _NativeExec.apply( regexp, arguments ), groups ) } },
            "test":     { value: function ( ) { return _NativeTest.apply( regexp, arguments ) } },
            "matchAll":    { value: function ( input ) {
                if ( regexp.global ) {
                    var result = [],
                        m, r;
                    
                    result.input = input;
                    regexp.lastIndex = 0;
                    while ( m = regexp.exec( input ) ) {
                        ( r = m.slice( 0 ) ).index = m.index;
                        result.push( _AttachNamedGroups( r, groups ) );
                    }
                    return result.length ? result : null
                }
                return input.match( regexp )
            } }
        } );
    };
    SEAC.RegExp.prototype = Object.create( new RegExp, {
        // toString: this method MUST return '[object RegExp]', if not the 
        // whole object will break!
        toString: { value: function ( ) { return '[object RegExp]'; } },
    } );
    
    SEAC.RegExp.Native = _ConvertToNative;
    SEAC.RegExp.Escape = _Escape;
    
} )( self.SEAC || ( self.SEAC = {} ) );

