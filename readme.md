# node-mcleaks

An unofficial node wrapper for the official [MCLeaks](https://mcleaks.net/) API

### Basic Usage:
```javascript
const mcleaks = require('node-mcleaks')

// Redeem a token:
mcleaks.redeem({
	token: 'tjqfv1rfbOChcllP' // get the token from mcleaks
}, (err, data) => {
	if(err) throw err
    let accdata = data.result // Tokens expire after 15 minutes so save the session somehow
    console.log(`Redeemed ${accdata.mcname}`)
    
    // Join a server:
    mcleaks.join({
        session: accdata.session, 
        mcname: accdata.mcname,
        server: 'mc.hypixel.net:25565',
        serverhash: '-1ja8s98dhj92h9aasd8'
        // Or if the serverhash is not specified it can be calculated automatically by specifying
        // serverid: '',
        // sharedsecret: '',
        // serverkey: ''
        // obviously you would need to obtain these values by other means
    }, (err, data) => {
        if(err) throw err
        console.log('Successfully joined server')
    })
})

```
