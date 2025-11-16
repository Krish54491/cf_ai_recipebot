<h1>Recipe Bot</h1>
This is a little app that will just generate or find some recipes for you and show them, I was planning to add the ablity for you to just buy them from the site, but I'm not sure how I would implement it without giving the AI some of your personal info(address, name, etc. (NO PAYMENT METHODS)) 
<h2>Prequisites</h2>
<li>Node.js v18+</li>
<li>npm</li>
<li>Cloudflare account</li>
<li>Wrangler CLI installed globally:</li>
</br>
<h1> Installation </h1>
first go in to the folder called recipebot after cloning the repo and install dependencies and run the server:

```
git clone https://github.com/Krish54491/cf_ai_recipebot.git
cd recipebot
npm install -g wrangler
npm install
npx wrangler dev
```
Now that the backend is up and running open a new terminal and go into recipeFrontend
```
cd recipebot/recipeFrontend
npm install
npm run dev
```
Finally the frontend site is running as well
open up it's instance and you're good too go!

Just a quick PSA some recipes will say there's a CORS error in console when there isn't it's just because some recipes get no results like mapo tofu :(