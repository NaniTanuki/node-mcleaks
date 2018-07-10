const request = require('request')
const crypto = require('crypto')

let Client = {}


/**
 * Java's annoying hashing method.
 * All credit to andrewrk
 * https://gist.github.com/andrewrk/4425843
 */
function performTwosCompliment (buffer) {
    var carry = true
    var i, newByte, value
    for (i = buffer.length - 1; i >= 0; --i) {
      value = buffer.readUInt8(i)
      newByte = ~value & 0xff
      if (carry) {
        carry = newByte === 0xff
        buffer.writeUInt8(carry ? 0 : (newByte + 1), i)
      } else {
        buffer.writeUInt8(newByte, i)
      }
    }
  }
  
  /**
   * Java's stupid hashing method
   * @param  {Buffer|String} hash     The hash data to stupidify
   * @param  {String} encoding Optional, passed to Buffer() if hash is a string
   * @return {String}          Stupidified hash
   */
Client.mcHexDigest = function mcHexDigest (hash, encoding) {
    if (!(hash instanceof Buffer)) { hash = new Buffer(hash, encoding) }
    // check for negative hashes
    var negative = hash.readInt8(0) < 0
    if (negative) performTwosCompliment(hash)
    var digest = hash.toString('hex')
    // trim leading zeroes
    digest = digest.replace(/^0+/g, '')
    if (negative) digest = '-' + digest
    return digest
}

/**
 * Redeem an alt token
 */
Client.redeem = function(options, cb) {
    var options = {
        uri: options.uri || 'https://auth.mcleaks.net/v1/redeem',
        method: 'POST',
        json: {
            token: options.token
        }
    }

    request(options, (err, response, body) => {
        if (body == null || body == undefined){
          err = new Error("MCLeaks retured nothing for the redeem");
        }else if(!err && !body.success) {
          err = new Error(`MCLeaks responded '${body.errorMessage}'`)
        }
        cb(err, body)
    })
}

/**
 * Join a server using a mcleaks session
 */
Client.join = function(options, cb) {
    let serverhash
    if(options.sharedsecret && options.serverkey) {
        serverhash = this.mcHexDigest(crypto.createHash('sha1')
            .update(options.serverid)
            .update(options.sharedsecret)
            .update(options.serverkey)
            .digest())
        console.log('making digest')
    }
    const test = JSON.stringify({
        session: options.session,
        mcname: options.mcname,
        serverhash: options.serverhash || serverhash,
        server: options.server
    });
    var options = {
        uri: options.uri || 'https://auth.mcleaks.net/v1/joinserver',
        method: 'POST',
        json: {
            session: options.session,
            mcname: options.mcname,
            serverhash: options.serverhash || serverhash,
            server: options.server
        }
    }

    request(options, (err, response, body) => {
        if(!err && !body.success) {
            err = new Error(`MCLeaks responded '${body.errorMessage}'`)
        }
        cb(err, body)
    })
}

module.exports = Client