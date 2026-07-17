fetch('http://ip-api.com/json/')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
