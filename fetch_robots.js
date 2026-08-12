const http = require('http');
http.get('http://127.0.0.1:3001/robots.txt', res => {
  let data = '';
  res.on('data', c => data+=c);
  res.on('end', () => console.log('HTTP:', res.statusCode, '\n' + data));
});
