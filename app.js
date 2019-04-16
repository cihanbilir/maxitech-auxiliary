const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

/**
* Call to get the number of followers for a Medium.com User.
*
* Related  links:
* https://github.com/Medium/medium-api-docs/issues/30#issuecomment-227911763
* https://github.com/Medium/medium-api-docs/issues/73
*/

// LODASH
const _ = require('lodash');

// REQUEST LIBRARY
const request = require('request-promise');

// WHACKY STUFF THEY PUT IN FRONT OF RESPONSE
const JSON_HIJACKING_PREFIX = '])}while(1);</x>';

// BUILD THE URL TO REQUEST FROM
function generateMediumProfileUri(username) {
  return `https://medium.com/@${username}?format=json`;
}

// HANDLE AND PARSE THE RESPONSE FROM MEDIUM
function massageHijackedPreventionResponse(response) {
  return JSON.parse(response.replace(JSON_HIJACKING_PREFIX, ''));
}

// EXTRACT THE COUNT FROM THE PROFILE DATA
function extractFollowedByCount(profileData) {
  const userId = _.get(profileData, 'payload.user.userId');
  return _.get(profileData, `payload.references.SocialStats.${userId}.usersFollowedByCount`, 0);
}

// DO THIS THING - RETURNS A PROMISE
function getFollwersForUser(username) {
  const options = {
    uri: generateMediumProfileUri(username),
    transform: massageHijackedPreventionResponse
  };

  return request(options)
    .then(profileData => {
      let numFollwers = extractFollowedByCount(profileData);
      return Promise.resolve(numFollwers);
    });
}

// LISTEN FOR QUERY STRINGS AND PARAMETERS
app.get('/mediumFollowerCount', function (req, res) {

  let username = req.query.username;
  if (typeof username !== 'undefined' && username) {
    username = 'maxitech';
  }

  getFollwersForUser(username)
    .then(function(count) {
      res.send(count.toString());
    });

  }
);

app.listen(port, () => console.log(`The Maxitech auxiliaries API is listening on ${port}!`))
