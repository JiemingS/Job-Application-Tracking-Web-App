import 'dotenv/config';
import app from './app.js';

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`JobTrack API running on http://localhost:${port}`);
});
