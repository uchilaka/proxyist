# Why Proxist
It's simple - for my personal and professional frontend web application projects, I needed a service that I developed myself and that I could trust to serve as a "server-side go-between" whenever I had JSON requests that required a server backend. 

# How it works
The `proxyist` service wherever it is deployed serves 1 function - being a backend where your frontend app needs one. This could be to serve any of the following functions:
- Bypass pesky CORS pre-flight requirements
- Fulfil server back-end request origination requirements (there might be a better way to do this with service worker delegation for progressive web apps. More on this later after I do some research)