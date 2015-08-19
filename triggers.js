var fs = require('fs'),
    cacheDir = '/angry-caching-proxy';

fs.readdirSync(cacheDir)
.filter(function(entry) {
    if (entry.substr(-5) == '.json') {
        var info = JSON.parse(fs.readFileSync(cacheDir + '/' + entry, 'utf8'));
        return info.responseHeaders['content-type'] !== 'application/x-debian-package'
            && /^.*archive.ubuntu.com$/.test(info.requestHeaders.host);
    }
})
.forEach(function(entry) {
    console.log('Deleting non-debian cache: ' + entry);
    fs.unlinkSync(cacheDir + '/' + entry.substr(0, entry.length - 5));
    fs.unlinkSync(cacheDir + '/' + entry);
})

module.exports = {
    "ubuntu": function isUbuntuRequest(req, res) {
        // Cache all archive.ubuntu.com, fi.archive.ubuntu.com etc. requests
        if (!/^.*archive.ubuntu.com$/.test(req.headers.host)) return false;
        return true;
    }
};
