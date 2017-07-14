const request = require('request')
const crypto = require('crypto')

let Client = {}


/**
 * Two's Compliment
 * All credit to andrewrk
 * https://gist.github.com/andrewrk/4425843
 */
function performTwosCompliment(buffer) {
  var carry = true;
  var i, newByte, value;
  for (i = buffer.length - 1; i >= 0; --i) {
    value = buffer.readUInt8(i);
    newByte = ~value & 0xff;
    if (carry) {
      carry = newByte === 0xff;
      buffer.writeUInt8(newByte + 1, i);
    } else {
      buffer.writeUInt8(newByte, i);
    }
  }
}

/**
 * Calculate hash thing
 * All credit to andrewrk
 * https://gist.github.com/andrewrk/4425843
 */
Client.mcHexDigest = function(str) {
  var hash = new Buffer(crypto.createHash('sha1').update(str).digest(), 'binary');
  // check for negative hashes
  var negative = hash.readInt8(0) < 0;
  if (negative) performTwosCompliment(hash);
  var digest = hash.toString('hex');
  // trim leading zeroes
  digest = digest.replace(/^0+/g, '');
  if (negative) digest = '-' + digest;
  return digest;

}

/**
 * Redeem an alt token
 */
Client.redeem = function(options, cb) {
    var options = {
        uri: options.uri || 'http://auth.mcleaks.net/v1/redeem',
        method: 'POST',
        json: {
            token: options.token
        }
    }

    request(options, (err, response, body) => {
        cb(err, body)
    })
}

/**
 * Join a server using a mcleaks session
 */
Client.join = function(options, cb) {
    let serverhash
    if(options.serverid && options.sharedsecret && options.serverkey) {
        serverhash = this.mcHexDigest(crypto.createHash('sha1')
            .update(options.serverid)
            .update(options.sharedsecret)
            .update(options.serverkey)
            .digest())
        console.log('making digest')
    }
    var options = {
        uri: options.uri || 'http://auth.mcleaks.net/v1/joinserver',
        method: 'POST',
        json: {
            session: options.session,
            mcname: options.mcname,
            serverhash: options.serverhash || serverhash,
            server: options.server
        }
    }

    request(options, (err, response, body) => {
        cb(err, body)
    })
}

module.exports = Client