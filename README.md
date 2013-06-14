Lively: Challenge #twitter (node)
===

First approach: wrap the http request in a new object that inherits EventEmitter.

Final approach: requests are event emitters themselves, so use them directly by extending them. Provide convenience methods for easy bind/unbind of events and to re-use existing requests if several clients make the same search.


How to use
---
#### Install npm modules
Yeah, I cheated :)

`$ npm install`

#### Command-line Interface
`$ node cli.js`

#### Web app
`$ node web.js`

Then visit [http://localhost:8080](http://localhost:8080). 
Hello CSS3, goodbye CPU.

#### Run Tests
`$ npm test`

> I don’t always test my code. But when I do, I do it in production.

npm modules used
---

- oauth
- socket.io
- urun
- utest
- assert


---

Instructions
-----

Fork this repository (please make a private repository) and push your commits as you are building the app. Then add @pierrevalade and @DarkMeld to your forked repository.

**Things to think about:**
- Tests
- If possible, don't use external dependencies (for example: Node.js APIs instead of NPM, or Apple's SDK instead of external libs).

Challenge #twitter (node)
-----

Build a node app (command prompt app is good) that asks for a search query, then it starts to stream live tweets that are related to that query.

Challenge #grid (mobile)
-----

Build an Android app or iOS app that reproduce the calendar grid from [Sunrise iOS app](https://itunes.apple.com/us/app/sunrise-calendar./id599114150?mt=8). Just the calendar grid experience, nothing else. Don't worry about the design, just the implementation.

![screenshots](http://cl.ly/image/2r2E3x471040/content)