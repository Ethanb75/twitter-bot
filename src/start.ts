import 'dotenv/config'
import express from 'express';
import { TwitterApi } from 'twitter-api-v2';

const app = express();
const PORT = 3000;

const authRedirectUri = 'http://localhost:3000/callback'; // Callback URL

const twitterClient = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
});

// do we need this?
// app.use(express.json())

let secret: any;

// Step 1: Redirect user to Twitter for authorization
app.get('/auth', async (req: any, res: any) => {
  // generate a link to authenticate
  const twitterRes = await twitterClient.generateAuthLink(authRedirectUri);

  const { url, oauth_token_secret } = twitterRes;

  // store the secret for later use
  secret = oauth_token_secret;

  // go to twitter link to approve auth
  res.redirect(url);
});

// 3. After approving auth, twitter calls this link
app.get('/callback', async (req: any, res: any) => {
  // Extract tokens from query string
  const { oauth_token, oauth_verifier } = req.query;

  if (!oauth_token || !oauth_verifier || !secret) {
    return res.status(400).send('You denied the app or your session expired!');
  }

  try {
    const userClient = new TwitterApi({
      appKey: appKey,
      appSecret: appSecret,
      accessToken: oauth_token,
      accessSecret: secret,
    });

    const { client: loggedClient, accessToken, accessSecret } = await userClient.login(oauth_verifier);

    try {
      const imagePath = './src/test2.jpg';
      const mediaId = await loggedClient.v1.uploadMedia(imagePath);

      console.log('mediaId', mediaId);

      // Create the tweet with the image and caption
      const tweet = await loggedClient.v2.tweet({
        text: 'Imagine eating a hot dog here',
        media: {
          media_ids: [mediaId],
        },
      });

      res.send(`Tweet posted: ${tweet.data.id}`);
    } catch (error) {
      console.error('Error posting tweet:', error);
      res.status(500).send('Failed to post tweet.');
    }
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send('Authentication failed.');
  }
});

app.listen(PORT, () => console.log(`Authorization server running on http://localhost:${PORT}`));
